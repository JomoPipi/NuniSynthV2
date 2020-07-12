






import { NuniGraphNode } from './nunigraph_node.js'
import { LZW_compress, LZW_decompress } from '../../helpers/lzw_compression.js'
import { 
    SubgraphSequencer, NuniAudioParam, 
    Sequencer, NuniGraphAudioNode 
    } from '../../webaudio2/internal.js'

type Destination = AudioNode | AudioParam | NuniAudioParam


const defaultSettings = () => ({
    x: 0.5, 
    y: 0.5,
    audioParamValues: {},
    audioNodeProperties: {}
})

export class NuniGraph {
    /**
     * The job of the NuniGraph is to keep track of nodes and their connections.
     * It has a list of nodes and a connection map.*
     */
    
    private nextId : number
    nodes : NuniGraphNode[]
    oneWayConnections : Indexable<ConnecteeData>

    constructor() {
        this.nextId = 0
        this.nodes = []
        this.oneWayConnections = {}

        this.initializeMasterGain()
    }

    private initializeMasterGain() {
        const masterGainSettings = Object.assign(defaultSettings(), { 
            audioParamValues: { [NodeTypes.GAIN]: 1 },
            x: 0.5, 
            y: 0.125,
            title: 'OUTPUT'
            })

        this.createNewNode(NodeTypes.GAIN, masterGainSettings)
    }

    createNewNode(type : NodeTypes, settings? : NodeSettings) {

        if (!settings) {
            settings = defaultSettings()
        }

        const node = new NuniGraphNode(this.nextId++, type, settings)

        this.nodes.push(node)

        return node
    }

    private copyNode(node : NuniGraphNode) {
        const copiedNode = this.convertNodeToNodeSettings(node)
        
        const { 
            type, 
            x, 
            y, 
            audioParamValues, 
            audioNodeProperties,
            title,
            INPUT_NODE_ID
            } = copiedNode

        const newX = clamp(0, x+0.07, 1)
        const newY = newX === 1 ? clamp(0, y-0.07, 1) : y
        const settings = {
            x: newX,
            y: newY,
            audioParamValues,
            audioNodeProperties,
            INPUT_NODE_ID
            } as NodeSettings

        if (!INPUT_NODE_ID) settings.title = title

        return this.createNewNode(type, settings)
    }

    copyNodes(nodes : NuniGraphNode[]) {
        const correspondenceMap = nodes.reduce((map,node) => {
            map[node.id] = this.copyNode(node)
            return map
            }, {} as { [key : number] : NuniGraphNode })

        const connections = this.oneWayConnections
        for (const id in connections) {
            for (const { id: id2, connectionType } of connections[id]) {
                const nodeA = this.nodes.find(node => node.id === +id)!
                const nodeB = this.nodes.find(node => node.id === id2)!
                const a = correspondenceMap[nodeA.id] || nodeA
                const b = correspondenceMap[nodeB.id] || nodeB

                if (a !== nodeA || b !== nodeB) {

                    if (b.audioNode instanceof NuniGraphAudioNode ) {
                        // WE NEED TO HANDLE THE INPUT NODES OF b

                        const innerInputNode 
                            = b.audioNode.controller.g.nodes.find(node => 
                                node.INPUT_NODE_ID && node.INPUT_NODE_ID.id === nodeA.id)

                        if (innerInputNode?.INPUT_NODE_ID && b !== nodeB) {
                            innerInputNode.INPUT_NODE_ID.id = a.id
                            innerInputNode.title = `INPUT (id-${a.id})`

                            b.audioNode.inputs[a.id] = innerInputNode
                            if (a !== nodeA)
                                delete b.audioNode.inputs[nodeA.id]
                        }
                    }

                    this.makeConnection(a, b, connectionType)
                }
            }
        }

        this.copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(nodes, correspondenceMap)

        return Object.values(correspondenceMap)
    }

    private copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(
        nodes : NuniGraphNode[], 
        mapToNewNode : Indexable<{ audioNode : Indexed, id : number }>) {
            
        for (const node of nodes) {
            if (node.audioNode instanceof Sequencer) {
                
                
                const matrix = node.audioNode.stepMatrix
                
                for (const id in matrix) {
                    const newId = mapToNewNode[id]?.id ?? id
                    mapToNewNode[node.id]
                        .audioNode
                        .stepMatrix[newId]
                        = matrix[id].slice()
                }
            }
        }
    }

    private disconnectFromSpecialNodes(node : NuniGraphNode) { 
        /** Motivation:
         * Since some nodes get 
         * disconnected in a custom way,
         * they won't get the message when 
         * an AudioNode calls disconnect() (with no arguments). 
         * So This is a temporary fix, here.
         * 
         * A better solution may be to wrap disconnect(), or 
         * stop using it all together.
         *  */ 
        for (const { audioNode } of this.nodes) {
            if (audioNode instanceof SubgraphSequencer && audioNode.channelData[node.id])
            {
                audioNode.removeInput(node)
            } 
            else if (audioNode instanceof NuniGraphAudioNode && audioNode.inputs[node.id]) {
                audioNode.removeInput(node)
            }
        }
    }

    deleteNode(node : NuniGraphNode) {
        // Without this, the setTimeout could keep looping forever:
        if (node.audioNode instanceof Sequencer) {
            node.audioNode.stop()
        }

        // Disconnect from other audioNodes:
        node.audioNode.disconnect()
        this.disconnectFromSpecialNodes(node)

        // Remove from this.nodes:
        const idx = this.nodes.findIndex(_node => 
            _node === node)
        this.nodes.splice(idx,1)

        // Remove from this.oneWayConnections:
        delete this.oneWayConnections[node.id]
        for (const id in this.oneWayConnections) {
            this.oneWayConnections[id] = 
            this.oneWayConnections[id].filter(({ id }) => id !== node.id)
        }
    }
    
    makeConnection(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {
        const connections = this.oneWayConnections[node1.id]

        const isDuplicate = 
            connections?.find(data => 
            data.id === node2.id && 
            data.connectionType === connectionType)

        if (isDuplicate) return;

        const destinationData = {
            id: node2.id, 
            connectionType
            }

        if (!connections || connections.length === 0)
            this.oneWayConnections[node1.id] = [destinationData]
        else
            connections.push(destinationData)

    
        const destination = this.prepareDestination(connectionType)(node2.audioNode)
        this.connect_audioNode_to_destination(node1, destination)
    }

    private connect_audioNode_to_destination(node1 : NuniGraphNode, destination : Destination) {
        
        if (destination instanceof NuniGraphAudioNode || destination instanceof SubgraphSequencer) {
            destination.addInput(node1)
        }
        else if (destination instanceof NuniAudioParam) {
            log('happened')
            node1.audioNode.connect(destination.offset)
            
        } else {
            node1.audioNode.connect(destination as AudioNode)
        }
    }

    disconnect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {
        const connections = this.oneWayConnections[node1.id]

        if (!connections) throw 'check what happened here'

        const connectionIndex = 
            connections.findIndex(data => 
            data.id === node2.id &&
            data.connectionType === connectionType)

        connections.splice(connectionIndex, 1)

        const destination = this.prepareDestination(connectionType)(node2.audioNode)
        this.disconnect_audioNode_from_destination(node1, destination)
    }

    private disconnect_audioNode_from_destination(node1 : NuniGraphNode, destination : Destination) {
        if (destination instanceof SubgraphSequencer || destination instanceof NuniGraphAudioNode) {
            destination.removeInput(node1)

        } else if (destination instanceof NuniAudioParam) {
            node1.audioNode.disconnect(destination.offset)

        } else {
            node1.audioNode.disconnect(destination as AudioNode)
        }
    }

    private prepareDestination (connectionType : ConnectionType) {
        return (destination : Indexed) => 
            connectionType === 'channel' ? destination : destination[connectionType] 
    }

    clear() {
        for (const node of [...this.nodes]) {
            if (node.id === 0) continue
            this.deleteNode(node)
        }
    }

    toRawString() {
        return JSON.stringify({
            connections: this.oneWayConnections,
            nodes: this.nodes.map(this.convertNodeToNodeSettings)
        })
            
    }

    private convertNodeToNodeSettings(node : NuniGraphNode) : Indexed {
        
        const nodeCopy = { 
            ...node,
            audioNode: { ...node.audioNode  }
        }

        // some audioNode properties need to be taken along but not all...
        for (const name in nodeCopy.audioNode) {
            if (!MustBeKeptOnAudioNodeForCopyingAfterConnectionsAreMade[name]) {
                delete nodeCopy.audioNode[name as AudioParams]
            }
        }

        const settings = {
            ...JSON.parse(JSON.stringify(nodeCopy)),
            audioNodeProperties: {}
            }
            
        for (const prop in Transferable_AudioNode_Properties) {
            // TODO remove this dirty dirty hack
            if (node.type === NodeTypes.SGS && (prop === 'stepMatrix' || prop === 'channelData')) {
                continue;
            }
            if (prop in node.audioNode) {
                settings.audioNodeProperties[prop] = 
                    node.audioNode[prop as AudioParams]
            }
        }
        return settings
    }

    fromRawString(s : string) {
        try {
            var { connections, nodes } = JSON.parse(s)
        } catch(e) {
            throw 'Error parsing new graph'
        }

        this.clear() 

        this.copyFrom(nodes, connections)
    }

    toString() {
        return LZW_compress(this.toRawString())
    }

    fromString(s : string) {
        return this.fromRawString(LZW_decompress(s))
    }

    private copyFrom(nodes : Indexed[], connections : Indexable<ConnecteeData>) {
        // nodes comes from JSON.parse(JSON.strigify(graphCode))

        if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'

        // Manually copy the master-gain, because it can't be deleted
        this.nodes[0].x = nodes[0].x
        this.nodes[0].y = nodes[0].y
        this.nodes[0].setValueOfParam('gain', nodes[0].audioParamValues.gain)

        this.nodes[0].title = 'OUTPUT'

        // recreate the nodes
        for (const node of nodes) {

            const { 
                id, 
                type, 
                x, 
                y, 
                audioParamValues, 
                audioNodeProperties,
                title,
                INPUT_NODE_ID
                } = node

            if (id === 0) continue
            
            const settings = {
                x, 
                y,
                audioParamValues,
                audioNodeProperties,
                INPUT_NODE_ID,
                } as NodeSettings
                if (!INPUT_NODE_ID) settings.title = title

            const newNode = new NuniGraphNode(id, type, settings)

            this.nodes.push(newNode)
        }

        // reconnect the nodes
        for (const id in connections) {
            for (const { id: id2, connectionType } of connections[id]) {
                const nodeA = this.nodes.find(node => node.id === +id)!
                const nodeB = this.nodes.find(node => node.id === id2)!
                
                if (nodeB.audioNode instanceof NuniGraphAudioNode ) {
                    // WE NEED TOP HANDLE THE INPUT NODES OF nodeB

                    const innerInputNode 
                        = nodeB.audioNode.controller.g.nodes.find(node => 
                            node.INPUT_NODE_ID && node.INPUT_NODE_ID.id === nodeA.id)

                    if (!innerInputNode?.INPUT_NODE_ID) throw 'It should be there'

                    innerInputNode.title = `INPUT (id-${nodeA.id})`
                    nodeB.audioNode.inputs[nodeA.id] = innerInputNode
                }

                this.makeConnection(nodeA, nodeB, connectionType)
            }
        }

        // Sampler needs to have stepMatrix and nSteps copied after connections are made
        for (const node of nodes) {
            // Can't use instanceof to check if audioNode is a SubgraphSequencer
            // because those nodes were parsed with JSON.parse
            if (node.type === NodeTypes.SGS || node.type === NodeTypes.B_SEQ) {
                const thisNode = this.nodes.find(n => n.id === node.id)!

                ;(<Sequencer>thisNode.audioNode).stepMatrix = node.audioNode.stepMatrix
            }
        }

        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1
    }
}
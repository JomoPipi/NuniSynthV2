






import { NuniGraphNode } from './nunigraph_node.js'
import { LZW_compress, LZW_decompress } from '../../helpers/lzw_compression.js'
import { 
    SubgraphSequencer, NuniAudioParam, 
    Sequencer, NuniGraphAudioNode
    } from '../../webaudio2/internal.js'

type Destination = AudioNode | AudioParam | NuniAudioParam


const defaultNodeSettings = () => ({
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
    readonly nodes : NuniGraphNode[]
    readonly oneWayConnections : Indexable<ConnecteeData>




    constructor() {
        this.nextId = 0
        this.nodes = []
        this.oneWayConnections = {}

        this.initializeMasterGain()
    }




    private initializeMasterGain() {
        const masterGainSettings = Object.assign(defaultNodeSettings(), { 
            audioParamValues: { [NodeTypes.GAIN]: 1 },
            x: 0.5, 
            y: 0.125,
            title: 'OUTPUT'
            })

        this.createNewNode(NodeTypes.GAIN, masterGainSettings)
    }




    createNewNode(type : NodeTypes, settings? : NodeCreationSettings) {

        if (!settings) {
            settings = defaultNodeSettings()
        }

        const node = new NuniGraphNode(this.nextId++, type, settings)

        this.nodes.push(node)

        return node
    }




    ///////////////////////////////////////////////////////////////////////// ctrl + click paste function /////////////////////////////////////////////////////////////////////////
    pasteNodes(X : number, Y : number, _nodes : Indexed[], connections : any[]) {

        const centerX = _nodes.reduce((a, { x }) => a + x, 0) / _nodes.length
        const centerY = _nodes.reduce((a, { y }) => a + y, 0) / _nodes.length

        // Make nodes
        const nodes = _nodes.map(({ 
            type, x, y, 
            audioParamValues, 
            audioNodeProperties, 
            INPUT_NODE_ID, title }) => {

            const newX = clamp(0, x - centerX + X, 1)
            const newY = clamp(0, y - centerY + Y, 1)
            const settings = {
                x: newX,
                y: newY,
                audioParamValues,
                audioNodeProperties,
                title: INPUT_NODE_ID ? undefined : title
            }

            return this.createNewNode(type, settings)
        })

        const retainedInputs = new Set()

        // Make connections
        for (const indexA in nodes) {

            const a = nodes[indexA]

            for (const { id: indexB, connectionType } of connections[indexA]) { 

                const b = nodes[indexB]

                if (b.audioNode instanceof NuniGraphAudioNode) {
                    // Handle the input nodes of b, again (TODO: cleanup)
                    const innerInputNode 
                        = b.audioNode.controller.g.nodes.find(node =>
                            node.INPUT_NODE_ID?.id === _nodes[indexA].oldId)
            
                    if (!innerInputNode) 
                        throw 'An input node with INPUT_NODE_ID = nodeA.id should exist inside node b'
        
                    // Reassign its' connectee id
                    innerInputNode.INPUT_NODE_ID!.id = a.id
                    innerInputNode.title = `INPUT (id-${a.id})`
                    retainedInputs.add(a.id)
        
                    b.audioNode.inputs[a.id] = innerInputNode
                    delete b.audioNode.inputs[_nodes[indexA].oldId]
                }
                
                this.makeConnection(a, b, connectionType)
            }
        }
        
        // Remove dangling inputNodes from modules
        for (const node of nodes) {
            
            // Disconnect loose inputnodes
            if (node.audioNode instanceof NuniGraphAudioNode) {

                // Without spreading the array, we would skip over indexes
                // Because deleteNode splices the array
                for (const moduleNode of [...node.audioNode.controller.g.nodes]) {
                    if (moduleNode.INPUT_NODE_ID) {
                        const input_id = moduleNode.INPUT_NODE_ID.id

                        if (!retainedInputs.has(input_id)) {
                            node.audioNode.controller.deleteNode(moduleNode, true)
                        }
                    }
                }
            }
        }


        // Copy subgraph sequencer 
        for (const i in _nodes) {
            const an = nodes[i].audioNode
            if (an instanceof SubgraphSequencer) {
                const matrix = _nodes[i].audioNode.stepMatrix

                // Map input id to new node id
                const matrixWithRemappedKeys = Object.keys(matrix).reduce((mat, key) => {
                    const index = _nodes.findIndex(({ oldId }) => oldId === +key)
                    
                    if (index >= 0) {
                        // The input exists and this row should be copied over
                        // log(`remapped stepMatrix key from ${key} to ${nodes[index].id}`)
                        mat[nodes[index].id] = matrix[key]
                    }

                    return mat
                }, {} as Indexable<Boolean>)

                an.stepMatrix = JSON.parse(JSON.stringify(matrixWithRemappedKeys))
            }
        }

        return nodes
    }
    /////////////////////////////////////////////////////////////////////////    /////////////////////////////////////////////////////////////////////////




    ///////////////////////////////////////////////////////////////////////// ctrl + s copy and paste function /////////////////////////////////////////////////////////////////////////
    private reproduceNode(node : NuniGraphNode) {
        
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
            } as NodeCreationSettings

        if (!INPUT_NODE_ID) settings.title = title

        if (node.type === NodeTypes.B_SEQ) {
            log ('stepMatrix =',settings.audioNodeProperties.stepMatrix)
        }
        return this.createNewNode(type, settings)
    }




    reproduceNodesAndConnections(nodes : NuniGraphNode[]) {
        
        const correspondenceMap = nodes.reduce((map,node) => {
            map[node.id] = this.reproduceNode(node)
            return map
        }, {} as { [key : number] : NuniGraphNode })

        this.reproduceConnections(correspondenceMap)

        this.copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(nodes, correspondenceMap)
        return Object.values(correspondenceMap)
    }




    reproduceConnections(mapToNewNode : { [id : number] : NuniGraphNode }) {
        for (const id1 in this.oneWayConnections) {
            for (const { id: id2, connectionType } of this.oneWayConnections[id1]) {
                // nodeA connects to nodeB
                const nodeA = this.nodes.find(node => node.id ===+id1)
                const nodeB = this.nodes.find(node => node.id === id2)
                if (!nodeA || !nodeB) throw 'Something is wrong here'
                const a = mapToNewNode[nodeA.id] || nodeA
                const b = mapToNewNode[nodeB.id] || nodeB

                if (a !== nodeA || b !== nodeB) {

                    this.copyModuleInputNodes(a, b, nodeA, nodeB)

                    this.makeConnection(a, b, connectionType)
                }
            }
        }
    }




    private copyModuleInputNodes(
        // TODO: figure out the type situation so b can be NuniGraphNode<NodeTypes.CUSTOM>
        a : NuniGraphNode, b : NuniGraphNode, nodeA : NuniGraphNode, nodeB : NuniGraphNode) {
        // ...[a, b, nodeA, nodeB] : NuniGraphNode[]) {

        // Handle the input node(s) of b
        if (b.audioNode instanceof NuniGraphAudioNode && b !== nodeB) {

            const innerInputNode 
                = b.audioNode.controller.g.nodes.find(node =>
                    node.INPUT_NODE_ID?.id === nodeA.id)
    
            if (!innerInputNode) 
                throw 'An input node with INPUT_NODE_ID = nodeA.id should exist inside node b'

            innerInputNode.INPUT_NODE_ID!.id = a.id
            innerInputNode.title = `INPUT (id-${a.id})`

            b.audioNode.inputs[a.id] = innerInputNode
            if (a !== nodeA) {
                // nodeA doesn't connect to b
                delete b.audioNode.inputs[nodeA.id]
            }
        }
    }
    



    private copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(
        nodes : NuniGraphNode[], 
        mapToNewNode : Indexable<{ audioNode : Indexed, id : number }>) {
            
        for (const node of nodes) {
            if (node.audioNode instanceof Sequencer) {
                // TODO 
                if (node.type === NodeTypes.B_SEQ) continue;
                
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
    /////////////////////////////////////////////////////////////////////////    /////////////////////////////////////////////////////////////////////////




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




    convertNodeToNodeSettings(node : NuniGraphNode) : Indexed {
        const nodeCopy = { 
            ...node,
            audioNode: { ...node.audioNode }
        }

        // some audioNode properties need to be taken along but not all...
        for (const name in nodeCopy.audioNode) {
            if (nodeCopy.type !== NodeTypes.SGS || !SGS_MustBeKeptOnAudioNodeForCopyingAfterConnectionsAreMade[name]) {
                delete nodeCopy.audioNode[name as AudioParams]
            }
        }

        const settings = {
            ...JSON.parse(JSON.stringify(nodeCopy)),
            audioNodeProperties: {},
            oldId: node.id
            }
            
        for (const prop in Transferable_AudioNode_Properties) {
            // TODO remove this dirty dirty hack
            if (node.type === NodeTypes.SGS && (prop === 'stepMatrix' || prop === 'channelData')) {
                continue;
            }
            if (prop in node.audioNode) {
                settings.audioNodeProperties[prop] = 
                    JSON.parse(JSON.stringify(node.audioNode[prop as AudioParams]))
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

        // Arrays stay in order
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

            // We already copied the master gain
            if (id === 0) continue
            
            const settings = {
                x, 
                y,
                audioParamValues,
                audioNodeProperties,
                INPUT_NODE_ID,
                } as NodeCreationSettings
                if (!INPUT_NODE_ID) settings.title = title

            const newNode = new NuniGraphNode(id, type, settings)
            this.nodes.push(newNode)
        }
        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1

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

        // SUBGRAPH SEQUENCER _ONLY_
        // Sampler needs to have stepMatrix and nSteps copied after connections are made
        for (const node of nodes) {
            // Can't use instanceof to check if audioNode is a SubgraphSequencer
            // because those nodes were parsed with JSON.parse
            if (node.type === NodeTypes.SGS) {
                const thisNode = this.nodes.find(n => n.id === node.id)!

                ;(<Sequencer>thisNode.audioNode).stepMatrix = node.audioNode.stepMatrix
            }
        }
    }




    toString() {
        return LZW_compress(this.toRawString())
    }




    fromString(s : string) {
        return this.fromRawString(LZW_decompress(s))
    }
}
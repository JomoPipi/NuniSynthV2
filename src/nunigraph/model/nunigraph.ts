






import { audioCtx } from '../../webaudio2/webaudio2.js'
    
import { NuniGraphNode, NodeSettings } from './nunigraph_node.js'
import { LZW_compress, LZW_decompress } from '../../helpers/lzw_compression.js'
import SubgraphSequencer from '../../webaudio2/sequencers/subgraph_sequencer.js'
import { Destination } from '../../webaudio2/volumenode_container.js'
import NuniAudioParam from '../../webaudio2/nuni_audioparam.js'
import Sequencer from '../../webaudio2/sequencers/sequencer.js'

const defaultSettings = () => ({
    display: { x: 0.5, y: 0.5 },
    audioParamValues: {},
    audioNodeProperties: {}
})

export class NuniGraph {
    /**
     * The job of the NuniGraph is to keep track of nodes and their connections.
     * It has a list of nodes and a connection map.*
     */
    
    nextId : number
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
            audioParamValues: { [NodeTypes.GAIN]: 0.5 },
            display: { x: 0.5, y: 0.125 }
            })

        this.createNewNode(NodeTypes.GAIN, masterGainSettings)
            .audioNode
            .connect(audioCtx.volume)
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
            } = copiedNode

        const newX = clamp(0, x+0.07, 1)
        const newY = newX === 1 ? clamp(0, y-0.07, 1) : y
        const settings = {
            display: { x: newX, y: newY },
            audioParamValues,
            audioNodeProperties
            }

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
                    this.connect(a, b, connectionType)
                }
            }
        }

        this.copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(nodes, correspondenceMap)

        return Object.values(correspondenceMap)
    }

    private copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(
        nodes : NuniGraphNode[], 
        mapToNewNode : Indexable<{ audioNode : Indexed }>) {

        for (const node of nodes) {
            if (node.audioNode instanceof Sequencer) {
                
                const matrix = node.audioNode.stepMatrix
                for (const key in matrix) {
                    mapToNewNode[node.id]
                        .audioNode
                        .stepMatrix[key] 
                        = matrix[key].slice()
                }
            }
        }
    }

    disconnectFromSpecialNodes(node : NuniGraphNode) { 
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
    
    connect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {
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
        
        if (destination instanceof SubgraphSequencer) {
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
        if (destination instanceof SubgraphSequencer) {
            destination.removeInput(node1)

        } else if (destination instanceof NuniAudioParam) {
            node1.audioNode.disconnect(destination.offset)

        } else {
            node1.audioNode.disconnect(destination)
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
        const settings = { 
            ...JSON.parse(JSON.stringify(node)), 
            audioNodeProperties: {}
            }
        for (const prop in isTransferable) {
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

        if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'

        // Manually copy the master-gain, because it can't be deleted
        this.nodes[0].x = nodes[0].x
        this.nodes[0].y = nodes[0].y
        this.nodes[0].setValueOfParam('gain', nodes[0].audioParamValues.gain)
        this.nodes[0].audioNode.disconnect()
        this.nodes[0].audioNode.connect(audioCtx.volume)

        // recreate the nodes
        for (const { 
                id, 
                type, 
                x, 
                y, 
                audioParamValues, 
                audioNodeProperties
                
                } of nodes) {

            if (id === 0) continue
            
            const settings = {
                display: { x, y },
                audioParamValues,
                audioNodeProperties
                }
            log('properties=',settings.audioNodeProperties)

            this.nodes.push(new NuniGraphNode(id, type, settings))
        }

        // reconnect the nodes
        for (const id in connections) {
            for (const { id: id2, connectionType } of connections[id]) {
                const nodeA = this.nodes.find(node => node.id === +id)!
                const nodeB = this.nodes.find(node => node.id === id2)!
                
                this.connect(nodeA, nodeB, connectionType)
            }
        }

        // Sampler needs to have stepMatrix and nSteps copied after connections are made
        for (const node of nodes) {
            // Can't use instanceof to check if audioNode is a SubgraphSequencer
            // because those nodes were parsed with JSON.parse
            if (node.type === NodeTypes.SGS || node.type === NodeTypes.B_SEQ) {
                const thisNode = this.nodes.find(n => n.id === node.id)!

                ;(<any>thisNode.audioNode).stepMatrix = node.audioNode.stepMatrix
            }
        }

        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1
    }
}
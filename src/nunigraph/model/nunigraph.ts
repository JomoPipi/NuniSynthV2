






import { NuniGraphNode } from './nunigraph_node.js'
import { LZW_compress, LZW_decompress } from '../../helpers/lzw_compression.js'
import { GateSequencer, Sequencer, NuniGraphAudioNode } from '../../webaudio2/internal.js'
import { ProcessorNode } from '../../webaudio2/nodes/processor/processor_node.js'

// type Destination = AudioNode | AudioParam | NuniAudioParam

const hasWeirdCopyProtocol = (node : NuniGraphNode)
    : node is NuniGraphNode<keyof typeof
        PostConnection_Transferable_InputRemappable_AudioNodeProperties> =>
    node.type in PostConnection_Transferable_InputRemappable_AudioNodeProperties

const weirdArray = PostConnection_Transferable_InputRemappable_AudioNodeProperties

const defaultNodeSettings = () => (
    { x: 0.5
    , y: 0.5
    , audioParamValues: {}
    , audioNodeProperties: {}
    })

const is
    = <T extends NodeTypes>(node : NuniGraphNode, type : T) 
    : node is NuniGraphNode<T> => node.type === type

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

    get masterGain() { return this.nodes[0] }




    private initializeMasterGain() {
        const masterGainSettings = Object.assign(defaultNodeSettings(), 
            { audioParamValues: { [NodeTypes.GAIN]: 1 }
            , x: 0.5
            , y: 0.125
            , title: 'OUTPUT'
            })

        this.createNewNode(NodeTypes.GAIN, masterGainSettings)
    }




    createNewNode<T extends NodeTypes>(type : T, settings : NodeCreationSettings = defaultNodeSettings()) {

        const node = new NuniGraphNode(this.nextId++, type, settings)
        this.nodes.push(node)

        return node
    }




    deleteNode(node : NuniGraphNode) {
        // Without this, the setTimeout could keep looping forever:
        if (node.audioNode instanceof Sequencer) 
        {
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
        for (const id in this.oneWayConnections) 
        {
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
        
        for (const { audioNode, type } of this.nodes) 
        {
            // TODO: refactor into IsInputAware Object
            // if (IsAwareOfInputIDs[type])
            // {
            //     audioNode.removeInput(node)
            // }


            // TODO: merge the duplicate if-bodies in a clean way
            if (audioNode instanceof GateSequencer && audioNode.channelData[node.id])
            {
                audioNode.removeInput(node)
            } 
            else if (audioNode instanceof NuniGraphAudioNode && audioNode.inputs[node.id]) 
            {
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

        const destinationData = 
            { id: node2.id
            , connectionType
            }

        if (!connections || connections.length === 0) 
        {
            this.oneWayConnections[node1.id] = [destinationData]
        }
        else
        {
            connections.push(destinationData)
        }
    
        this.connect_audioNode_to_destination(node1, node2, connectionType)
    }




    private prepareDestination (connectionType : ConnectionType) {
        return (destination : Indexed) => 
            connectionType === 'channel' 
                ? destination 
                : destination[connectionType] 
    }
    



    disconnect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {
        const connections = this.oneWayConnections[node1.id]

        if (!connections) throw 'Check what happened here'

        const connectionIndex = 
            connections.findIndex(data => 
                data.id === node2.id &&
                data.connectionType === connectionType)

        connections.splice(connectionIndex, 1)

        this.disconnect_audioNode_from_destination(node1, node2, connectionType)
    }



    
    private connect_audioNode_to_destination(
        node1 : NuniGraphNode, 
        node2 : NuniGraphNode, 
        connectionType : ConnectionType) {

        const destination = this.prepareDestination(connectionType)(node2.audioNode)
        
        if (destination instanceof NuniGraphAudioNode || destination instanceof GateSequencer
            || UsesConnectionProtocol2[node2.type])
        {
            destination.addInput(node1)
        }
        else if (destination instanceof ProcessorNode)
        {
            node1.audioNode.connect(destination.inputChannelNode)
        }
        else if (destination instanceof NuniAudioParam) 
        {
            node1.audioNode.connect(destination.offset)
        } 
        else 
        {
            node1.audioNode.connect(destination)
        }
    }




    private disconnect_audioNode_from_destination(
        node1 : NuniGraphNode, 
        node2 : NuniGraphNode, 
        connectionType : ConnectionType) {

        const destination = this.prepareDestination(connectionType)(node2.audioNode)

        // TODO: Change this methods to disconnect_node_from_destination, and put this condition in a config object.
        if (destination instanceof GateSequencer || destination instanceof NuniGraphAudioNode
            || UsesConnectionProtocol2[node2.type])
        {
            destination.removeInput(node1)
        } 
        else if (destination instanceof ProcessorNode)
        {
            node1.audioNode.disconnect(destination.inputChannelNode)
        }
        else if (destination instanceof NuniAudioParam) 
        {
            node1.audioNode.disconnect(destination.offset)
        }
        else 
        {
            node1.audioNode.disconnect(destination)
        }
    }




    clear() {
        for (const node of [...this.nodes]) 
        {
            if (node.id === 0) continue
            this.deleteNode(node)
        }
    }



    //? --------------------------------------------------------------------------------------------------------------------------------------------
    // * NOW BEGIN ALL THE COPY-RELATED FUNCTIONS
    //? --------------------------------------------------------------------------------------------------------------------------------------------

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // ! ctrl + click paste function 
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    pasteNodes(X : number, Y : number, _nodeDataArray : Indexed[], connections : any[]) {

        const nNodes = _nodeDataArray.length
        const centerX = _nodeDataArray.reduce((a, { x }) => a + x, 0) / nNodes
        const centerY = _nodeDataArray.reduce((a, { y }) => a + y, 0) / nNodes


        //* Make nodes
        const nodeCopies = _nodeDataArray.map((
            { type, oldId, x, y, audioParamValues
            , audioNodeProperties, INPUT_NODE_ID, title }) => {

            const newX = clamp(0, x - centerX + X, 1)
            const newY = clamp(0, y - centerY + Y, 1)
            const settings =
                { x: newX
                , y: newY
                , audioParamValues
                , audioNodeProperties
                , title: INPUT_NODE_ID || oldId === 0 
                    ? undefined 
                    : title
                }

            return this.createNewNode(type, settings)
        }) as NuniGraphNode[]

        const retainedInputs = new Set()

        //* Make connections
        for (const indexA in nodeCopies) 
        {
            const a = nodeCopies[indexA]

            for (const { id: indexB, connectionType } of connections[indexA]) 
            { 
                const b = nodeCopies[indexB]

                if (is(b, NodeTypes.MODULE))
                {
                    // Handle the input nodeCopies of b, again (TODO: cleanup)
                    const innerInputNode 
                        = b.audioNode.controller.g.nodes.find(node =>
                            node.INPUT_NODE_ID?.id === _nodeDataArray[indexA].oldId)
            
                    if (!innerInputNode) 
                    {
                        throw 'An input node with INPUT_NODE_ID = nodeA.id should exist inside node b'
                    }
        
                    // Reassign its' connectee id
                    innerInputNode.INPUT_NODE_ID!.id = a.id
                    innerInputNode.title = `INPUT (id-${a.id})`
                    retainedInputs.add(a.id)
        
                    b.audioNode.inputs[a.id] = innerInputNode
                    delete b.audioNode.inputs[_nodeDataArray[indexA].oldId]
                }

                this.makeConnection(a, b, connectionType)
            }
        }
        

        //! Remove dangling inputNodes from modules
        for (const node of nodeCopies) 
        {
            
            // Disconnect loose inputnodes
            if (is(node, NodeTypes.MODULE))
            {
                // Without spreading the array, we would skip over indexes
                // Because deleteNode splices the array
                for (const moduleNode of [...node.audioNode.controller.g.nodes]) 
                {
                    if (moduleNode.INPUT_NODE_ID) 
                    {
                        const input_id = moduleNode.INPUT_NODE_ID.id

                        if (!retainedInputs.has(input_id)) 
                        {
                            node.audioNode.controller.deleteNode(moduleNode, { force: true })
                        }
                    }
                }
            }
        }

        //! Copying the properties that can only be transferred after connections are made..
        const mapToNewNode = _nodeDataArray.reduce((a, node, i) => {
            a[node.oldId] = nodeCopies[i]
            return a
        }, {} as Indexable<NuniGraphNode>)
        
        for (const i in _nodeDataArray) 
        {
            const node = nodeCopies[i]
            if (hasWeirdCopyProtocol(node))
            {
                const an = node.audioNode
                const _an = _nodeDataArray[i].audioNodeProperties
                for (const propName of weirdArray[node.type]) 
                {
                    const targetObj : Indexed = (<Indexed>an)[propName] = {}
                    const sourceObj = _an[propName as keyof typeof _an]
    
                    // We look through they keys of the source object
                    for (const id in sourceObj) 
                    {
                        // If the node with id ${id} got copied over
                        const copiedInputNode = mapToNewNode[id]
                        if (copiedInputNode) 
                        {
                            // We pass the property over and update the id
                            targetObj[copiedInputNode.id] = JSON.parse(JSON.stringify(sourceObj[id]))
                        }
                    }
                }
            }
        }
        

        return nodeCopies
    }
    


    
    private reproduceNode(node : NuniGraphNode) {
        
        const copiedNode = this.convertNodeToNodeSettings(node)
        
        const 
            { type
            , x
            , y
            , audioParamValues
            , audioNodeProperties
            , title
            , INPUT_NODE_ID
            } = copiedNode

        const newX = clamp(0, x + 0.07, 1)
        const newY = newX === 1 ? clamp(0, y - 0.07, 1) : y
        const settings = 
            { x: newX
            , y: newY
            , audioParamValues
            , audioNodeProperties
            , INPUT_NODE_ID
            } as NodeCreationSettings

        if (!INPUT_NODE_ID && node.id !== 0) settings.title = title
        
        const _node = this.createNewNode(type, settings)
        return _node
    }




    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    // ! ctrl + s copy and paste function
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
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
        for (const id1 in this.oneWayConnections) 
        {
            for (const { id: id2, connectionType } of this.oneWayConnections[id1]) 
            {
                // nodeA connects to nodeB
                const nodeA = this.nodes.find(node => node.id ===+id1)
                const nodeB = this.nodes.find(node => node.id === id2)
                if (!nodeA || !nodeB) throw 'Something is wrong here'
                const a = mapToNewNode[nodeA.id] || nodeA
                const b = mapToNewNode[nodeB.id] || nodeB
                const connectionDoesntExist = a !== nodeA || b !== nodeB

                if (connectionDoesntExist) 
                {
                    this.copyModuleInputNodes(a, b, nodeA, nodeB)
                    this.makeConnection(a, b, connectionType)
                }
            }
        }
    }




    private copyModuleInputNodes(
        a : NuniGraphNode, b : NuniGraphNode, nodeA : NuniGraphNode, nodeB : NuniGraphNode) {

        // Handle the input node(s) of b
        if (is(b, NodeTypes.MODULE) && b !== nodeB) 
        {
            const innerInputNode 
                = b.audioNode.controller.g.nodes.find(node =>
                    node.INPUT_NODE_ID?.id === nodeA.id)
    
            if (!innerInputNode) 
            {
                throw 'An input node with INPUT_NODE_ID = nodeA.id should exist inside node b'
            }

            innerInputNode.INPUT_NODE_ID!.id = a.id
            innerInputNode.title = `INPUT (id-${a.id})`

            b.audioNode.inputs[a.id] = innerInputNode
            if (a !== nodeA) 
            {
                // nodeA doesn't connect to b
                delete b.audioNode.inputs[nodeA.id]
            }
        }
    }
    



    private copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(
        nodes : NuniGraphNode[], 
        mapToNewNode : Indexable<NuniGraphNode>) {

        //* Here, we remap the inputs of the properties use them as keys
        for (const node of nodes) 
        {
            if (hasWeirdCopyProtocol(node))
            {
                for (const propName of weirdArray[node.type]) 
                {
                    const an = mapToNewNode[node.id].audioNode
                    const targetObj = an[propName as keyof typeof an] as Indexed
                    const sourceObj = node.audioNode[propName]
    
                    for (const key in sourceObj) 
                    {
                        const newId = mapToNewNode[key]?.id ?? +key
                        
                        targetObj[newId] = 
                            JSON.parse(JSON.stringify(sourceObj[key]))
    
                        // If there isn't some node, with the old id, connected to the new node
                        if (newId !== +key && !this.oneWayConnections[key].some(data => +data.id === +key))
                        {
                            // Then we delete this entry that refers to it
                            delete targetObj[key]
                        }
                    }
                }
            }
        }
    }
    /////////////////////////////////////////////////////////////////////////    /////////////////////////////////////////////////////////////////////////




    toRawString() {
        return JSON.stringify(this.toJSON())
    }



    toJSON() {
        return {
            connections: JSON.parse(JSON.stringify(this.oneWayConnections)),
            nodes: this.nodes.map(this.convertNodeToNodeSettings)
        }
    }




    convertNodeToNodeSettings(node : NuniGraphNode) : NodeCreationSettings & { type : NodeTypes } {

        const nodeCopy = { ...node, audioNode: {} }

        const settings = 
            { ...JSON.parse(JSON.stringify(nodeCopy))
            , audioNodeProperties: {}
            , oldId: node.id
            }
            
        for (const prop in Transferable_AudioNodeProperties)
        {
            if (prop in node.audioNode) 
            {
                const p = prop as keyof typeof node.audioNode
                settings.audioNodeProperties[prop] = 
                    JSON.parse(JSON.stringify(node.audioNode[p]))
            }
        }

        return settings
    }




    fromRawString(s : string) {
        try 
        {
            var json = JSON.parse(s)
        } 
        catch(e) 
        {
            throw `Error parsing graph JSON string: ${e}`
        }
        this.fromJSON(json)
    }




    // ! Copy function #1
    fromJSON({ connections, nodes }  : Indexed) {

        this.clear()

        // Arrays stay in order
        if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'

        // Manually copy the master-gain, because it can't be deleted
        this.masterGain.x = nodes[0].x
        this.masterGain.y = nodes[0].y
        this.masterGain.setValueOfParam('gain', nodes[0].audioParamValues.gain)

        this.masterGain.title = 'OUTPUT'

        // recreate the nodes
        for (const node of nodes)
        {
            const 
                { id
                , type
                , x
                , y
                , audioParamValues
                , audioNodeProperties
                , title
                , INPUT_NODE_ID
                } = node

            // We've already copied the master gain
            if (id === 0) continue
            
            const settings : NodeCreationSettings = 
                { x 
                , y
                , audioParamValues
                , audioNodeProperties
                , INPUT_NODE_ID
                }

            if (!INPUT_NODE_ID) settings.title = title

            const newNode = new NuniGraphNode(id, type, JSON.parse(JSON.stringify(settings)))
            this.nodes.push(newNode)
        }
        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1

        // Reconnect the nodes
        for (const id in connections) 
        {
            for (const { id: id2, connectionType } of connections[id]) 
            {
                const nodeA = this.nodes.find(node => node.id === +id)!
                const nodeB = this.nodes.find(node => node.id === id2)!
                
                if (is(nodeB, NodeTypes.MODULE)) 
                { // ! WE NEED TO HANDLE THE INPUT NODES OF nodeB

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

        // ! Transfer the post-connection properties
        for (const node of nodes) 
        {
            if (hasWeirdCopyProtocol(node))
            {
                const thisNode = this.nodes.find(n => n.id === node.id)!
                for (const prop of weirdArray[node.type]) 
                {
                    // TODO: remove the ignores and give the serialized data a proper type
                    // @ts-ignore
                    if (node.audioNodeProperties[prop] || node.audioNode[prop])
                    {
                        ;(thisNode.audioNode as Indexed)[prop] = // @ts-ignore
                            node.audioNodeProperties[prop]
                            || node.audioNode[prop] // <- legacy. TODO: remove, when graphs are transfererred.
                    }
                }
            }
        }
    }




    toString() {
        return LZW_compress(this.toRawString())
    }




    fromString(s : string) {
        return this.fromRawString(LZW_decompress(s))
    }




    insertNodeIntoConnection(node : NuniGraphNode, fromNode : NuniGraphNode, toNode : NuniGraphNode, connection_type : ConnectionType) {
        /* The idea here is to insert the node without having to actually disconnect fromNode from toNode.
        Why does this matter? Because of those pesky input-aware nodes (channel sequencers and modules at this time)
        whose states change when disconnecting the node. */

        if (IsAwareOfInputIDs[toNode.type])
        {
        // Go around the disconnect and makeConnection functions..

            // Remove the connection from the connection list
            for (const key in this.oneWayConnections[fromNode.id]) 
            {
                const { id, connectionType } = this.oneWayConnections[fromNode.id][key]
                if (id === toNode.id && connectionType === connection_type)
                {
                    this.oneWayConnections[fromNode.id].splice(+key, 1)
                }
            }

            // Update connections so that node connects to toNode, and prevent duplicate connections
            const connectionsOfNode = 
            this.oneWayConnections[node.id] = 
                (this.oneWayConnections[node.id] || [])

            const connectionAlreadyExists = 
                connectionsOfNode.some(({ id, connectionType }) => 
                    id === toNode.id && connectionType === connection_type)

            if (!connectionAlreadyExists)
            {
                connectionsOfNode.push(
                    { id: toNode.id
                    , connectionType: connection_type 
                    })
            }
            else
            {
                log('Prevented a duplicate')
            }
            
            const an = toNode.audioNode as GateSequencer | NuniGraphAudioNode

            if (connectionAlreadyExists)
            {
                an.removeInput(fromNode)
            }
            else 
            {
                an.replaceInput(fromNode, node)
            }

            // Connect fromNode to node the normal way:
            this.makeConnection(fromNode, node, 'channel')
        }
        else
        {
            this.disconnect(fromNode, toNode, connection_type)
            this.makeConnection(fromNode, node, 'channel')
            this.makeConnection(node, toNode, connection_type)
        }
    }
}
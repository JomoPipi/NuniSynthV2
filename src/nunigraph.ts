






type NodeOptions = { 
    display : { x : number, y : number }, 
    audioParamValues : Indexible,
    audioNodeType : string
}




class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates an AudioNode.
     * The node is just a data container, but the AudioNode
     * can be connected in several ways.
     */
    id : number
    type : NodeTypes
    audioNode : Indexible
    x : number
    y : number
    audioNodeType : string
    audioParamValues : Indexible
    
    constructor(id : number, type : NodeTypes, options : NodeOptions) {

        // change display: {x,y} to just x,y later to save space on the string conversions
        // (will require changing/throwing away all currently saved graphs :/)
        const { display: {x,y}, audioParamValues, audioNodeType } = options

        this.id = id
        this.type = type
        this.x = x
        this.y = y

        this.audioNode = audioCtx[createAudioNode[type]]()
        this.audioNodeType = audioNodeType || this.audioNode.type
        this.audioNode.type = this.audioNodeType
        this.audioParamValues = audioParamValues 

        for (const param of AudioNodeParams[type]) {
            const value = audioParamValues[param] ?? DefaultParamValues[param]
            this.setValueOfParam(param, value)
        }
    }

    setValueOfParam(param : string, value: number) {
        
        this.audioParamValues[param] = value
        this.audioNode[param].setValueAtTime(value, 0)
    }
}








class NuniGraph {
    /**
     * The job of the NuniGraph is to keep track of nodes and their connections.
     * It has a list of nodes and a connection map.*
     */
    
    nextId : number
    nodes : NuniGraphNode[]
    oneWayConnections : Indexed<ConnecteeData>
    selectedNode : NuniGraphNode | null

    constructor() {
        this.nextId = 0
        this.nodes = []
        this.oneWayConnections = {}
        this.selectedNode = null

        this.initializeMasterGain()
    }

    private initializeMasterGain() {
        const masterGainOptions = { 
            audioParamValues: { [NodeTypes.GAIN]: 0.5 },
            display: { x: 0.5, y: 0.125 },
            audioNodeType: ''
            }

        this.newNode(NodeTypes.GAIN, masterGainOptions)
            .audioNode
            .connect(audioCtx.destination)
    }

    newNode(type : NodeTypes, options? : NodeOptions) {

        if (!options) {
            options = {
                display: {x:0.5, y:0.5},
                audioParamValues: {},
                audioNodeType: ''
                }
        }

        const node = new NuniGraphNode(this.nextId++, type, options)
        this.nodes.push(node)

        return node
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
        connect_node_to_destination(node1, destination)
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
        disconnect_node_from_destination(node1, destination)
    }

    private prepareDestination (connectionType : ConnectionType) {
        return (x : Indexible) => 
            connectionType === 'channel' ? x : x[connectionType] 
    }

    selectNodeFunc() { throw 'Should be implemented in attach_handlers.ts' }

    selectNode (node : NuniGraphNode) {
        this.selectedNode = node
        this.selectNodeFunc()
    }

    unselectNode() {
        this.selectedNode = null
        this.selectNodeFunc()
    }

    deleteSelectedNode() {

        const node = this.selectedNode
        if (!node) return;

        if (D('connection-type-prompt')!.style.display === 'block') {
            // Find a clean way to cancel the current connection being made, instead of doing this.
            alert("Please finish what you're doing, first.")
            return;
        }
        if (node.id === 0) throw 'How can someone try to delete the node with ID of 0?'
        
        // disconnect from other audioNodes
        node.audioNode.disconnect()

        // remove from this.nodes
        const idx = this.nodes.findIndex(_node => 
            _node === node)
        this.nodes.splice(idx,1)

        // remove from this.oneWayConnections
        delete this.oneWayConnections[node.id]
        for (const id in this.oneWayConnections) {
            this.oneWayConnections[id] = 
            this.oneWayConnections[id].filter(({ id }) => id !== node.id)
        }

        GraphCanvas.render()
    }

    private clear() {
        for (const node of [...this.nodes]) {
            if (node.id === 0) continue
            this.selectedNode = node
            this.deleteSelectedNode()
        }
        this.selectedNode = null
        GraphCanvas.render()
    }

    toString() {

        return LZW_compress(
        JSON.stringify(this.oneWayConnections) + ':::' +
        JSON.stringify(this.nodes).replace(/,"audioNode":{}/g, ""))
    }

    fromString(s : string) {

        s = LZW_decompress(s)
        
        try {
            var [connections, nodes] = s.split(':::').map(s => JSON.parse(s))
        } catch(e) {
            throw 'Error parsing new graph'
        }

        this.clear() 
        
        if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'

        // manually copy the master-gain
        this.nodes[0].x = nodes[0].x
        this.nodes[0].y = nodes[0].y
        this.nodes[0].setValueOfParam('gain', nodes[0].audioParamValues.gain)
        this.nodes[0].audioNode.disconnect()
        this.nodes[0].audioNode.connect(audioCtx.destination)

        // recreate the nodes
        for (const { id, type, x, y, audioParamValues, audioNodeType } of nodes) {

            if (id === 0) continue
            
            const options = {
                display: { x, y },
                audioParamValues,
                audioNodeType,
                }

            this.nodes.push(new NuniGraphNode(id, type, options))
        }

        // reconnect the nodes
        for (const id in connections) {
            for (const { id: id2, connectionType } of connections[id]) {
                const nodeA = this.nodes.find(node => node.id === +id)!
                const nodeB = this.nodes.find(node => node.id === id2)!
                
                this.connect(nodeA, nodeB, connectionType)
            }
        }
        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1

        GraphCanvas.render()
    }
    
}
const G = new NuniGraph()
Keyboard.attachToGraph(G)
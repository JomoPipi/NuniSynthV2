






class NuniGraph {
    /**
     * The job of the NuniGraph is to keep track of nodes and their connections.
     * It has a list of nodes and a connection map.*
     */
    
    nextId : number
    nodes : NuniGraphNode[]
    oneWayConnections : Indexable<ConnecteeData>
    selectedNode : NuniGraphNode | null

    constructor() {
        this.nextId = 0
        this.nodes = []
        this.oneWayConnections = {}
        this.selectedNode = null

        this.initializeMasterGain()
    }

    private initializeMasterGain() {
        const masterGainSettings = { 
            audioParamValues: { [NodeTypes.GAIN]: 0.5 },
            display: { x: 0.5, y: 0.125 },
            audioNodeType: '',
            audioNodeSettings: {}
            }

        this.newNode(NodeTypes.GAIN, masterGainSettings)
            .audioNode
            .connect(audioCtx.destination)
    }

    newNode(type : NodeTypes, settings? : NodeSettings) {

        if (!settings) {
            settings = {
                display: {x:0.5, y:0.5},
                audioParamValues: {},
                audioNodeType: '',
                audioNodeSettings: {},
                }
        }

        const node = new NuniGraphNode(this.nextId++, type, settings)
        this.nodes.push(node)

        return node
    }

    deleteNode(node : NuniGraphNode) {
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
        return (x : Indexed) => 
            connectionType === 'channel' ? x : x[connectionType] 
    }

    selectNodeFunc() { throw 'Should be implemented somewhere' }

    selectNode (node : NuniGraphNode) {
        this.selectedNode = node
        this.selectNodeFunc()
    }

    unselectNode() {
        this.selectedNode = null
        this.selectNodeFunc()
    }

    clear() {
        for (const node of [...this.nodes]) {
            if (node.id === 0) continue
            this.deleteNode(node)
        }
        this.selectedNode = null
    }

    toRawString() {
        return (
            JSON.stringify(this.oneWayConnections) + ':::' +
            JSON.stringify(this.nodes).replace(/,"audioNode":{}/g, "")
            )
    }

    fromRawString(s : string) {

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
        for (const { 
                id, 
                type, 
                x, 
                y, 
                audioParamValues, 
                audioNodeType,  
                audioNode,
                } of nodes) {

            if (id === 0) continue
            
            const settings = {
                display: { x, y },
                audioParamValues,
                audioNodeType,
                audioNodeSettings: {
                    kbMode: audioNode.kbMode
                    }
                }

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
        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1
    }

    toString() {
        return LZW_compress(this.toRawString())
    }

    fromString(s : string) {
        return this.fromRawString(LZW_decompress(s))
    }
    
}




const G = new NuniGraph()

Keyboard.attachToGraph(G)
Buffers.attachToGraph(G)
const GraphCanvas = createGraphCanvas(G, D('nunigraph-canvas') as HTMLCanvasElement)
set_selectNodeFunc(
    G, D('node-value-container') as HTMLDivElement, 
    D('connection-type-prompt') as HTMLDivElement)
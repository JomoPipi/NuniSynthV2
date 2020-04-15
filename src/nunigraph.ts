






class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates an AudioNode.
     * It knows nothing about other NuniGraphNodes, but the AudioNode
     * that it holds gets connected to other NuniGraphNodes' AudioNodes.
     * It's a data container.
     */
    id: number
    type: NodeTypes
    audioNode:  Indexible
    x:number
    y:number
    audioNodeType: string
    audioParamValues: Indexible
    
    constructor( id : number, type : NodeTypes, options : {
            display: {x:number, y:number},
            audioParamValues: Indexible
            audioNodeType: string
        } ) {

        // change display: {x,y} to just x,y
        const { display: {x,y}, audioParamValues, audioNodeType } = options

        this.id = id
        this.type = type
        this.x = x
        this.y = y

        this.audioNode = audioCtx[createAudioNode[type]]()
        this.audioNodeType = audioNodeType || this.audioNode.type // is this needed?
        this.audioNode.type = this.audioNodeType
        this.audioParamValues = audioParamValues 

        for (const param of AudioNodeParams[type]) {

            const value = audioParamValues[param] || DefaultParamValues[param]
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
    
    nodes: NuniGraphNode[]
    oneWayConnections: { [id1 : number] : ConnecteeData }
    nextId : number
    selectedNode : NuniGraphNode | null

    constructor() {
        this.nodes = []
        this.oneWayConnections = {}

        this.nextId = 0
        this.selectedNode = null

        this.initialize()
    }

    initialize() {
        const options = { 
            audioParamValues: { [NodeTypes.GAIN]: 0.5 },
            display: {x:0.5,y:0.125},
            audioNodeType: ''
            }

        this.newNode(NodeTypes.GAIN, options).audioNode.connect(audioCtx.destination)
    }

    newNode(type : NodeTypes, options : null | { display: { x:number, y:number }, 
                                                audioParamValues: Indexible,
                                                audioNodeType: string
                                                }
    ) {
        if (!options) {
            options = {
                display: {x:0.5, y:0.5},
                audioParamValues: {},
                audioNodeType: ''
            }
        }

        const node = new NuniGraphNode( this.nextId++, type, options )
        this.nodes.push(node)

        return node
    }
    
    connect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {

        if (G.oneWayConnections[node1.id]?.find(data => data.id === node2.id && data.connectionType === connectionType)) {
            // if this connection already exists, ignore it.
            return;
        }

        const destination = this.setConnection(connectionType)(node2.audioNode)
        connect_node_to_destination(node1, destination)
        
        const destinationData = {
            id: node2.id, 
            connectionType
            }

        if (!this.oneWayConnections[node1.id] || this.oneWayConnections[node1.id].length === 0)
            this.oneWayConnections[node1.id] = [destinationData]
        else
            this.oneWayConnections[node1.id].push(destinationData)
    }

    disconnect(node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) {
        if (!G.oneWayConnections[node1.id]) throw 'check what happened here'
        const connectionIndex = G.oneWayConnections[node1.id].findIndex(data => data.id === node2.id && data.connectionType === connectionType)
        G.oneWayConnections[node1.id].splice(connectionIndex,1)
        // delete G.oneWayConnections[node1.id] as empty array if it ever becomes undesired

        const destination = this.setConnection(connectionType)(node2.audioNode)
        // node1.audioNode.disconnect(destination)
        disconnect_node_from_destination(node1, destination)
    }

    selectNodeFunc () {}

    setConnection (connectionType : ConnectionType) {
        return (x : Indexible) => 
            connectionType === 'channel' ? x : x[connectionType] 
    }

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
            alert("Please finish what you're doing, first.")
            return;
        }

        if (node.id === 0) {
            alert('cannot delete this!')
            return;
        }
        // disconnect from others
        node.audioNode.disconnect()

        // remove from this.nodes
        const idx = this.nodes.findIndex(_node => 
            _node === node)
        this.nodes.splice(idx,1)

        // remove from oneWayConnections
        delete this.oneWayConnections[node.id]
        for (const id in this.oneWayConnections) {
            this.oneWayConnections[id] = 
            this.oneWayConnections[id].filter(({ id }) => id !== node.id)
        }

        GraphCanvas.render()
    }

    clear() {
        for (const node of [...this.nodes]) {
            if (node.id === 0) continue
            this.selectedNode = node
            this.deleteSelectedNode()
        }
        this.selectedNode = null
        GraphCanvas.render()
    }

    toString() {
        
        return compressGraphString(
        JSON.stringify(this.oneWayConnections) + ':::' +
        JSON.stringify(this.nodes).replace(/,"audioNode":{}/g, ""))
    }

    fromString(s : string) {
        s = decompressGraphString(s)
        // const oldUserGraph = this.toString()
        let connections, nodes
        try {
            ;[connections, nodes] = s.split(':::').map(s => JSON.parse(s))
        } catch(e) {
            throw 'error in fromString'
        }
        this.clear() 
        
        if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'
        this.nodes[0].x = nodes[0].x
        this.nodes[0].y = nodes[0].y
        this.nodes[0].setValueOfParam('gain', nodes[0].audioParamValues.gain)
        this.nodes[0].audioNode.disconnect()
        this.nodes[0].audioNode.connect(audioCtx.destination)

        // recreate the nodes
        for (const node of nodes.filter(
        (node : NuniGraphNode) => node.id !== 0)) {
            
            const options = {
                display: {x: node.x, y: node.y},
                audioParamValues: node.audioParamValues,
                audioNodeType: node.audioNodeType
            }

            this.nodes.push(new NuniGraphNode(node.id, node.type, options))
        }

        // reconnect the nodes
        for (const id in connections) {
            for (const { id: id2, connectionType } of connections[id]) {
                const node1 = this.nodes.find(node => node.id === +id)!
                const node2 = this.nodes.find(node => node.id === id2)!
                
                this.connect(node1, node2, connectionType)
            }
        }
        this.nextId = 
            Math.max(...this.nodes.map(node=>node.id)) + 1

        GraphCanvas.render()
    }
    
}
const G = new NuniGraph()
Keyboard.attachToGraph(G)

















function compressGraphString
(uncompressed : string) : string {
    // Build the dictionary.
    const dictionary : { [n:string]:number } = {};
    for (let i = 0; i < 256; i++)
    {
        dictionary[String.fromCharCode(i)] = i;
    }

    let word = '';
    let dictSize = 256;
    const result = [];

    for (let i = 0, len = uncompressed.length; i < len; i++)
    {
        let curChar = uncompressed[i];
        let joinedWord = word + curChar;

        // Do not use dictionary[joinedWord] because javascript objects 
        // will return values for myObject['toString']
        if (dictionary.hasOwnProperty(joinedWord)) 
        {
            word = joinedWord;
        }
        else
        {
            result.push(dictionary[word]);
            // Add wc to the dictionary.
            dictionary[joinedWord] = dictSize++;
            word = curChar;
        }
    }

    if (word !== '')
    {
        result.push(dictionary[word]);
    }

    return result
        .map(c=>String.fromCharCode(c))
        .join('')
}








function decompressGraphString(compressedStr : string) : string
{
    const compressed = 
        compressedStr.split('').map((c:string)=>c.charCodeAt(0))
    // Initialize Dictionary (inverse of compress)
    const dictionary : { [key:number]:string } = {};
    for (let i = 0; i < 256; i++)
    {
        dictionary[i] = String.fromCharCode(i);
    }

    let word = String.fromCharCode(compressed[0]);
    let result = word;
    let entry = '';
    let dictSize = 256;

    for (let i = 1, len = compressed.length; i < len; i++)
    {
        let curNumber = compressed[i];

        if (dictionary[curNumber] !== undefined)
        {
            entry = dictionary[curNumber];
        }
        else
        {
            if (curNumber === dictSize)
            {
                entry = word + word[0];
            }
            else
            {
                throw 'Error in processing'
            }
        }

        result += entry;

        // Add word + entry[0] to dictionary
        dictionary[dictSize++] = word + entry[0];

        word = entry;
    }

    return result;
}

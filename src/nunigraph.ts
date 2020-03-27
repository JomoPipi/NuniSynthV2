
/**
 * The job of the NuniGraph is to keep track of nodes, their values, and their connections
 * 
 * The graph should include:
 *      A list of NuniNodes
 *      A connection map
 *      functions to add, update, connect, delete nodes
 * 
 */

class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates an AudioNode.
     * It knows nothing about other NuniGraphNodes
     */
    id: number
    type: NodeTypes
    audioNode: any// AudioNode & {[param:string]:AudioParam}
    x:number
    y:number
    audioNodeType: string
    [param: string]: any
    
    constructor( id : number, type : NodeTypes, options : {
            display: {x:number, y:number},
            audioParamValues: { [param:string]: number }
            audioNodeType: string
        } ) {
        this.id = id
        this.type = type
        const { display: {x,y}, audioParamValues, audioNodeType } = options

        this.x = x
        this.y = y

        this.audioNode = audioCtx[createAudioNode[type]]()
        this.audioNodeType = audioNodeType || this.audioNode.type

        if (MustBeStarted[type])
            this.audioNode.start(0)

        for (const param of AudioNodeParams[type]) {

            const value = audioParamValues[param] || DefaultParamValues[param]
            this[param] = { value: value } 

            
            this.setValueOfParam(param, value)

        }
    }
    setValueOfParam(param : string, value: number) {
        
        this[param].value = value
        this.audioNode[param].setValueAtTime(value, 0)
    }
}

const G = (_ => {
    /**
     * The graph connects the nodes and keeps track of how they are connected
     * There will always be at least one node, the master gain
     */

    newId.id = 0; function newId() { return newId.id++ }
    
    const nodes = [] as NuniGraphNode[]

    const newNode = 
        (type : NodeTypes, 
        options : null | 
            { display: { x:number, y:number }, 
              audioParamValues: {},
              audioNodeType: string
            }
    ) => {
        if (!options) {
            options = {
                display: {x:0.5, y:0.5},
                audioParamValues: {},
                audioNodeType: ''
            }
        }

        const node = new NuniGraphNode( newId(), type, options )
        nodes.push(node)

        return node
    }

    const options = { 
        audioParamValues: { [NodeTypes.GAIN]: 0.5 },
        display: {x:0.5,y:0.125},
        audioNodeType: ''
        }

    const masterGainNode = newNode(NodeTypes.GAIN, options) 
    masterGainNode.audioNode.connect(audioCtx.destination)
    
    let selectedNode : any
    selectedNode = null

    const setConnection = (connectionType : ConnectionType) => 
        (x : any) => connectionType === 'channel' ? x : x[connectionType]

    const oneWayConnections :
        { [id1:number] : ConnecteeData }  = {}

    const connect = (node1 : NuniGraphNode, node2 : NuniGraphNode, connectionType : ConnectionType) => 
    {
        const destination = setConnection(connectionType)(node2.audioNode)
        
        node1.audioNode.connect(destination)
        
        const destinationData = {
            id: node2.id, 
            connectionType: connectionType
            }

        if (!oneWayConnections[node1.id] || oneWayConnections[node1.id].length === 0)
            oneWayConnections[node1.id] = [destinationData]
        else
            oneWayConnections[node1.id].push(destinationData)
    }

    const selectNodeFunc = function() {}

    return {

        nodes: nodes,
        oneWayConnections: oneWayConnections,

        selectedNode: selectedNode,

        newNode: newNode,
        connect: connect,
        isPromptingUserToSelectConnectee: false,
        selectNodeFunc: selectNodeFunc,

        selectNode: function(node : NuniGraphNode) {
            this.selectedNode = node
            this.selectNodeFunc()
        },

        unselectNode: function() {
            this.selectedNode = null
            this.selectNodeFunc()
        },

        deleteSelectedNode: function () {
            const node = this.selectedNode
            if (D('connection-type-prompt')!.style.display === 'block') {
                alert("Please finish what you're doing, first.")
                return;
            }

            if (node.id === 0) {
                alert('cannot delete this!')
                return;
            }
            // disconnect from others
            this.selectedNode.audioNode.disconnect()

            // remove from this.nodes
            const idx = this.nodes.findIndex(_node => 
                _node === node)
            this.nodes.splice(idx,1)

            // remove from oneWayConnections
            delete oneWayConnections[node.id]
            for (const id in oneWayConnections) {
                oneWayConnections[id] = 
                oneWayConnections[id].filter(({ id }) => id !== node.id)
            }

            GraphCanvas.render()
        },

        clear: function() {
            for (const node of [...this.nodes]) {
                if (node.id === 0) continue
                this.selectedNode = node
                this.deleteSelectedNode()
            }
            this.selectedNode = null
            GraphCanvas.render()
        },

        toString: function() {
            
            return JSON.stringify(this.oneWayConnections) + ':::' +
            JSON.stringify(this.nodes)
        },
// G.fromString(`{"3":[{"id":0,"connectionType":"channel"}],"5":[{"id":6,"connectionType":"channel"}],"6":[{"id":3,"connectionType":"frequency"}]}:::[{"id":0,"type":"gain","x":0.35585585585585583,"y":0.1848341232227488,"audioNode":{},"gain":{"value":0}},{"id":3,"type":"oscillator","x":0.2072072072072072,"y":0.4597156398104265,"audioNode":{},"audioNodeType":"sine","frequency":{"value":100},"detune":{"value":0}},{"id":5,"type":"oscillator","x":0.7297297297297297,"y":0.5308056872037915,"audioNode":{},"audioNodeType":"sine","frequency":{"value":3},"detune":{"value":0}},{"id":6,"type":"gain","x":0.4954954954954955,"y":0.476303317535545,"audioNode":{},"gain":{"value":50}}]`)

// {"1":[{"id":2,"connectionType":"frequency"}],"2":[{"id":4,"connectionType":"channel"}],"4":[{"id":0,"connectionType":"channel"},{"id":2,"connectionType":"frequency"},{"id":5,"connectionType":"frequency"}],"5":[{"id":1,"connectionType":"channel"},{"id":4,"connectionType":"gain"}],"6":[{"id":4,"connectionType":"gain"}],"7":[{"id":6,"connectionType":"channel"}],"11":[{"id":6,"connectionType":"gain"}],"12":[{"id":11,"connectionType":"channel"}]}:::[{"id":0,"type":"gain","x":0.10311284046692606,"y":0.12638580931263857,"audioNode":{},"gain":{"value":0.00005}},{"id":1,"type":"gain","x":0.42023346303501946,"y":0.5764966740576497,"audioNode":{},"gain":{"value":1000}},{"id":2,"type":"oscillator","x":0.5457875457875457,"y":0.38802660753880264,"audioNode":{},"audioNodeType":"sine","frequency":{"value":8},"detune":{"value":0}},{"id":4,"type":"gain","x":0.42412451361867703,"y":0.12416851441241686,"audioNode":{},"gain":{"value":3000}},{"id":5,"type":"oscillator","x":0.2801556420233463,"y":0.3946784922394678,"audioNode":{},"audioNodeType":"sine","frequency":{"value":8},"detune":{"value":0}},{"id":6,"type":"gain","x":0.7334630350194552,"y":0.13303769401330376,"audioNode":{},"gain":{"value":1001.0000000000033}},{"id":7,"type":"oscillator","x":0.7373540856031129,"y":0.5676274944567627,"audioNode":{},"audioNodeType":"triangle","frequency":{"value":8},"detune":{"value":0}},{"id":11,"type":"gain","x":0.8813229571984436,"y":0.3215077605321508,"audioNode":{},"gain":{"value":3000}},{"id":12,"type":"oscillator","x":0.8871595330739299,"y":0.565410199556541,"audioNode":{},"audioNodeType":"sine","frequency":{"value":8},"detune":{"value":0}}]

        fromString: function(s : string) {
            this.clear()
            const [connections, nodes] = s.split(':::').map(s => JSON.parse(s))
            
            if (nodes[0].id !== 0) throw 'Oh, I did not expect this.'
            this.nodes[0].x = nodes[0].x
            this.nodes[0].y = nodes[0].y
            this.nodes[0].setValueOfParam('gain', nodes[0].gain.value)
            this.nodes[0].audioNode.disconnect()
            this.nodes[0].audioNode.connect(audioCtx.destination)

            // recreate the nodes
            for (const node of nodes.filter((node : any) => node.id !== 0)) {

                const t : NodeTypes = node.type
                const values : {[key:string] : number} = {}
                for (const param of AudioNodeParams[t]) {
                    values[param] = node[param].value
                }
                const options = {
                    display: {x: node.x, y: node.y},
                    audioParamValues: values,
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


            GraphCanvas.render()
        }
    }
})()
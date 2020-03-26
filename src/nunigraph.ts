
/**
 * The job of the NuniGraph is to keep track of nodes, their values, and their connections
 * 
 * The graph should include:
 *      A list of NuniNodes
 *      A connection map
 *      functions to add, update, connect, delete nodes
 * 
 */

enum NodeTypes {
    GAIN = 'gain',
    OSC = 'oscillator',
    FILTER = 'filter'
}

type AudioNodeTypes = GainNode | OscillatorNode | BiquadFilterNode
type AudioParamString = 'gain' | 'frequency' | 'detune' | 'Q'

const createAudioNode = {
    [NodeTypes.GAIN]:   'createGain',
    [NodeTypes.OSC]:    'createOscillator',
    [NodeTypes.FILTER]: 'createBiquadFilter'
}

const MustBeStarted = {
    [NodeTypes.GAIN]:   false,
    [NodeTypes.OSC]:    true,
    [NodeTypes.FILTER]: false
}

const SupportsInputChannels = {
    [NodeTypes.GAIN]:   true,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: true
}

const AudioNodeParams = {
    [NodeTypes.GAIN]: 
        ['gain'] as AudioParamString[],
    [NodeTypes.OSC]: 
        ['frequency','detune'] as AudioParamString[],
    [NodeTypes.FILTER]: 
        ['frequency','Q','gain','detune'] as AudioParamString[],
}

const DefaultParamValues : any = {
    gain: 0.5,
    frequency: 440,
    detune: 0,
    Q: 1
}

type ConnectionType = NodeTypes | 'channel'

class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates an AudioNode
     * It knows nothing about other NuniGraphNodes
     */
    id: number
    type: NodeTypes
    audioNode: any// & {[param:string]:AudioParam}
    x:number
    y:number
    [param: string]: any
    
    constructor( id : number, type : NodeTypes, options : {
            display: {x:number, y:number},
            audioParamValues: { [param:string]: number }
        } ) {
        this.id = id
        this.type = type
        const { display: {x,y}, audioParamValues } = options

        this.x = x
        this.y = y

        this.audioNode = audioCtx[createAudioNode[type]]()

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
              audioParamValues: any 
            }
    ) => {
        if (!options) {
            options = {
                display: {x:0.5, y:0.5},
                audioParamValues: {}
            }
        }

        const node = new NuniGraphNode( newId(), type, options )
        nodes.push(node)

        return node
    }

    const options = { 
        audioParamValues: { [NodeTypes.GAIN]: 0.5 },
        display: {x:0.5,y:0.125}
        }

    const masterGainNode = newNode(NodeTypes.GAIN, options) 
    masterGainNode.audioNode.connect(audioCtx.destination)
    
    let selectedNode : any
    selectedNode = null

    const setConnection = (connectionType : ConnectionType) => 
        (x : any) => connectionType === 'channel' ? x : x[connectionType]

    const oneWayConnections : { [id1:number] : any }  = {}

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
            if (D('connection-type-prompt')!.style.display !== 'none') {
                alert("Please finish what you're doing, first.")
                return;
            }

            if (node.id === 0) {
                alert('cannot delete this!')
                return;
            }
            // disconnect from otthers
            this.selectedNode.audioNode.disconnect()

            // remove from this.nodes
            const idx = this.nodes.findIndex(_node => 
                _node === node)
            this.nodes.splice(idx,1)

            // remove from oneWayConnections
            delete oneWayConnections[node.id]
            for (const id in oneWayConnections) {
                const idArr = oneWayConnections[id]
                
                const idx = idArr.findIndex((id : number) => 
                    id === node.id)
                if (idx >= 0)
                    this.nodes.splice(idx, 1)
            }

            GraphCanvas.render()
        }
    }
})()

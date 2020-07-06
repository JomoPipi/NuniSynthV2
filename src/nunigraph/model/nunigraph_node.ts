






import { 
    audioCtx, OscillatorNode2 , BufferNode2, SubgraphSequencer,
    BufferSequencer, AudioBufferCaptureNode, NuniGraphAudioNode
    } from '../../webaudio2/internal.js'




type AudioNodeMap = {
    [NodeTypes.GAIN]:   GainNode
    [NodeTypes.OSC]:    OscillatorNode2
    [NodeTypes.FILTER]: BiquadFilterNode
    [NodeTypes.PANNER]: StereoPannerNode
    [NodeTypes.DELAY]:  DelayNode
    [NodeTypes.BUFFER]: BufferNode2
    [NodeTypes.SGS]:    SubgraphSequencer
    [NodeTypes.B_SEQ]:  BufferSequencer
    [NodeTypes.CSN]:    ConstantSourceNode
    [NodeTypes.RECORD]: AudioBufferCaptureNode
    [NodeTypes.CUSTOM]: NuniGraphAudioNode
}

type AudioNode2<T extends NodeTypes> 
    = AudioNodeMap[T] 
    & { [key in AudioParams] : AudioParam }
    
export  class NuniGraphNode<T extends NodeTypes = NodeTypes> {

    id : number
    type : T
    audioNode : AudioNode2<T>
    x : number
    y : number
    audioParamValues : Indexable<number>
    title? : string
    readonly INPUT_NODE_ID? : { id : number }

    
    constructor(id : number, type : T, settings : NodeSettings) {

        // Change display: {x,y} to just x,y later to save space on the string conversions
        // (will require changing/throwing away all currently saved graphs :/)
        const { 
            x, 
            y, 
            audioParamValues, 
            audioNodeProperties,
            title,
            INPUT_NODE_ID
            } = settings

        this.id = id
        this.type = type
        this.x = x
        this.y = y
        this.title = title
        this.INPUT_NODE_ID = INPUT_NODE_ID

        this.audioNode = (<Indexed>audioCtx)[createAudioNode[type]]()
        
        if (MustBeStarted[type]) (<ConstantSourceNode>this.audioNode).start(0)

        Object.assign(this.audioNode, audioNodeProperties)

        this.audioParamValues = audioParamValues

        for (const param of AudioNodeParams[type]) {
            const value 
                =  audioParamValues[param] 
                ?? DefaultParamValues[param]
            this.setValueOfParam(param, value)
        }
    }

    setValueOfParam(param : AudioParams, value: number) {
        this.audioParamValues[param] = value
        this.audioNode[param].value = value
    }
}
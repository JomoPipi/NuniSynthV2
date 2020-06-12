






import { audioCtx } from '../../webaudio2/webaudio2.js'
import { OscillatorNode2 } from '../../webaudio2/note_in/oscillator2.js'
import { BufferNode2 } from '../../webaudio2/note_in/buffer2.js'
import SubgraphSequencer from '../../webaudio2/sequencers/subgraph_sequencer.js'
import BufferSequencer from '../../webaudio2/sequencers/buffer_sequencer.js'




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
}

const AudioNodeTypeMap = {
    [NodeTypes.GAIN]:   GainNode,
    [NodeTypes.OSC]:    OscillatorNode2,
    [NodeTypes.FILTER]: BiquadFilterNode,
    [NodeTypes.PANNER]: StereoPannerNode,
    [NodeTypes.DELAY]:  DelayNode,
    [NodeTypes.BUFFER]: BufferNode2,
    [NodeTypes.SGS]:    SubgraphSequencer,
    [NodeTypes.B_SEQ]:  BufferSequencer,
    [NodeTypes.CSN]:    ConstantSourceNode,
}

type AudioNode2<T extends NodeTypes> 
    = AudioNodeMap[T] 
    & { [key in AudioParams] : AudioParam }
    

export type NodeSettings = { 
    display : { x : number, y : number }, 
    audioParamValues : Indexable<number>,   // Uses draggable number inputs
    audioNodeProperties : CustomAudioNodeProperties 
}

export class NuniGraphNode<T extends NodeTypes = NodeTypes> {

    id : number
    type : T
    audioNode : AudioNode2<T>
    x : number
    y : number
    audioParamValues : Indexable<number>
    
    constructor(id : number, type : T, settings : NodeSettings) {

        // Change display: {x,y} to just x,y later to save space on the string conversions
        // (will require changing/throwing away all currently saved graphs :/)
        const { 
            display: {x,y}, 
            audioParamValues, 
            audioNodeProperties
            
            } = settings

        this.id = id
        this.type = type
        this.x = x
        this.y = y

        this.audioNode = (<any>audioCtx)[createAudioNode[type]]()
        
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
        this.audioNode[param].setValueAtTime(value, 0)
    }
}
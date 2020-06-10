






import { audioCtx } from '../../webaudio2/webaudio2.js'
import { OscillatorNode2 } from '../../webaudio2/note_in/oscillator2.js'
import { BufferNode2 } from '../../webaudio2/note_in/buffer2.js'
import SubgraphSequencer from '../../webaudio2/sequencers/subgraph_sequencer.js'
import BufferSequencer from '../../webaudio2/sequencers/buffer_sequencer.js'


interface AudioNodeTypeMap {
    [NodeTypes.GAIN]:   GainNode,
    [NodeTypes.OSC]:    OscillatorNode2,
    [NodeTypes.FILTER]: BiquadFilterNode,
    [NodeTypes.PANNER]: StereoPannerNode,
    [NodeTypes.DELAY]:  DelayNode,
    [NodeTypes.BUFFER]: BufferNode2,
    [NodeTypes.SGS]:    SubgraphSequencer,
    [NodeTypes.B_SEQ]:  BufferSequencer
}

type AudioNodeType<T extends keyof AudioNodeTypeMap> = 
    AudioNodeTypeMap[T] 
    & {
        [key in AudioParams] : any
    }

class AudioNode2<T extends NodeTypes> {

}

export type NodeSettings = { 
    display : { x : number, y : number }, 
    audioParamValues : Indexable<number>,   // Uses draggable number inputs
    audioNodeProperties : CustomAudioNodeProperties 
}

export class NuniGraphNode {

    id : number
    type : NodeTypes
    audioNode : Indexed // GainNode | OscillatorNode2 | BiquadFilterNode | StereoPannerNode | DelayNode | BufferNode2 | SubgraphSequencer | BufferSequencer
    x : number
    y : number
    audioParamValues : Indexable<number>
    
    constructor(id : number, type : NodeTypes, settings : NodeSettings) {

        // Change display: {x,y} to just x,y later to save space on the string conversions
        // (will require changing/throwing away all currently saved graphs :/)
        const { 
            display: {x,y}, 
            audioParamValues, 
            audioNodeProperties,
            
            } = settings

        this.id = id
        this.type = type
        this.x = x
        this.y = y

        this.audioNode = (<any>audioCtx)[createAudioNode[type]]()
        
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
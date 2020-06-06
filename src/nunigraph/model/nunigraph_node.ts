






import { audioCtx } from '../../webaudio2/webaudio2.js'

// const createAudioNode 
// : { [key in NodeTypes] : keyof AudioContext2 } =
// {
//     [NodeTypes.GAIN]:   'createGain',
//     [NodeTypes.OSC]:    'createOscillator2',
//     [NodeTypes.FILTER]: 'createBiquadFilter',
//     [NodeTypes.PANNER]: 'createStereoPanner',
//     [NodeTypes.DELAY]:  'createDelay',
//     [NodeTypes.BUFFER]: 'createBuffer2',
//     [NodeTypes.SGS]:    'createSubgraphSequencer'
// }

export type NodeSettings = { 
    display : { x : number, y : number }, 
    audioParamValues : Indexable<number>,   // Uses draggable number inputs
    audioNodeProperties : CustomAudioNodeProperties 
}

export class NuniGraphNode {

    id : number
    type : NodeTypes
    audioNode : Indexed
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

        this.audioNode = (<Indexed>audioCtx)[createAudioNode[type]]()
        Object.assign(this.audioNode, audioNodeProperties)

        this.audioParamValues = audioParamValues

        for (const param of AudioNodeParams[type]) {
            const value 
                =  audioParamValues[param] 
                ?? DefaultParamValues[param]
            this.setValueOfParam(param, value)
        }
    }

    setValueOfParam(param : string, value: number) {
        
        this.audioParamValues[param] = value
        this.audioNode[param].setValueAtTime(value, 0)
    }
}
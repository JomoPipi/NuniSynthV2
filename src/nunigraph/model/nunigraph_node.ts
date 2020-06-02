






import { audioCtx } from '../../webaudio2/webaudio2.js'

export type NodeSettings = { 
    display : { x : number, y : number }, 
    audioParamValues : Indexed,
    audioNodeProperties : Indexed
}

export class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates a Web Audio Api AudioNode.
     */
    id : number
    type : NodeTypes
    audioNode : Indexed
    x : number
    y : number
    audioParamValues : Indexed
    
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
        for (const prop in audioNodeProperties) {
            this.audioNode[prop] 
                =  audioNodeProperties[prop]
                ?? this.audioNode[prop]
        }

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
        ;(<Indexed>this.audioNode)[param].setValueAtTime(value, 0)
    }
}
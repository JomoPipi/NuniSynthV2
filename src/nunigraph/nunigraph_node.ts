






type NodeSettings = { 
    display : { x : number, y : number }, 
    audioParamValues : Indexed,
    audioNodeType : string,
    audioNodeSettings : {
        kbMode? : NodeKbMode
        },
}

class NuniGraphNode {
    /**
     * Each NuniGraphNode holds and updates an AudioNode.
     * The node is just a data container, but the AudioNode
     * can be connected in several ways.
     */
    id : number
    type : NodeTypes
    audioNode : Indexed
    x : number
    y : number
    title : string
    audioNodeType : string
    audioParamValues : Indexed
    
    constructor(id : number, type : NodeTypes, settings : NodeSettings) {

        // Change display: {x,y} to just x,y later to save space on the string conversions
        // (will require changing/throwing away all currently saved graphs :/)
        const { 
            display: {x,y}, 
            audioParamValues, 
            audioNodeType,
            audioNodeSettings
        
            } = settings

        this.id = id
        this.title = this.type = type
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

        if (audioNodeSettings.kbMode &&
            audioNodeSettings.kbMode !== 'none') {
            this.audioNode.setKbMode(KB.mode)
        }
    }

    setValueOfParam(param : string, value: number) {
        
        this.audioParamValues[param] = value
        ;(this.audioNode as Indexed)[param].setValueAtTime(value, 0)
    }
}
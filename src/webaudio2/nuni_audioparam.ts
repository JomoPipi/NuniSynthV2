


            



export default class NuniAudioParam extends ConstantSourceNode {
    /** Constructible Audio Params for custom Web Audio nodes
     */

    constructor(ctx : AudioContext) {
        super(ctx)
        this.offset.value = 0
        this.start(ctx.currentTime)
    }
    
    setValueAtTime(value : number, time : never) {
        this.offset.value = value
    }
}



            



export class NuniAudioParam extends ConstantSourceNode {
    /** Constructible Audio Params for custom Web Audio nodes
     */

    constructor(ctx : AudioContext) {
        super(ctx)
        this.offset.value = 0
        this.start(ctx.currentTime)
    }
    
    set value(value : number) {
        this.offset.value = value
    }
}
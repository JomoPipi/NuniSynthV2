






export default class NuniGraphAudioNode {
    ctx : AudioContext
    static createController? : Function

    constructor(ctx : AudioContext) {
        this.ctx = ctx
    }
    connect(){}
    disconnect(){}
}
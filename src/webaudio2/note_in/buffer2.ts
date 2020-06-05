






import { bufferController } from '../../buffer_utils/internal.js'
import { NuniSourceNode, NuniSourceAudioParam } from './nuni_source_node.js'

export class BufferNode2 extends NuniSourceNode {
    /**
     * A wrapper around AudioBufferSourceNode that allows
     * it to be played by the keyboard.
     */

    loop : boolean
    bufferKey : number
    detune : NuniSourceAudioParam
    playbackRate : NuniSourceAudioParam
    
    constructor(ctx : AudioContext) {
        super(ctx)

        this.loop = true
        this.bufferKey = 0
        this.detune = new NuniSourceAudioParam(ctx)
        this.playbackRate = new NuniSourceAudioParam(ctx)

        this.kbMode = 'none'
    }

    createSource() {
        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.src.connect(src.detune)
        this.playbackRate.src.connect(src.playbackRate)
        src.buffer = bufferController.buffers[this.bufferKey]
        src.loop = this.loop

        return src
    }
}
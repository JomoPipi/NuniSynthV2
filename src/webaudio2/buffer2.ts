






import { bufferController } from '../nunigraph/init.js'
import { NuniSourceNode, NuniSourceAudioParam } from './nuni_source_node.js'
import { KB } from './keyboard.js'

export class BufferNode2 extends NuniSourceNode {
    /**
     * A wrapper around AudioBufferSourceNode that allows
     * it to be played by the keyboard.
     */

    loop : boolean
    bufferIndex : number
    detune : NuniSourceAudioParam
    playbackRate : NuniSourceAudioParam
    
    constructor(ctx : AudioContext) {
        super(ctx)

        this.loop = true
        this.bufferIndex = 0
        this.detune = new NuniSourceAudioParam(ctx)
        this.playbackRate = new NuniSourceAudioParam(ctx)

        this.setKbMode('none')
    }

    prepareSource(key : number) { // happens at noteOff
        const sources = this.sources

        sources[key] && sources[key].disconnect()
        const src = sources[key] = this.ctx.createBufferSource()
        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)

        this.detune.src.connect(src.detune)
        this.playbackRate.src.connect(src.playbackRate)

        if (key !== this.MONO) {
            src.detune.value = KB.scale[KB.keymap[key]]
        }

        src.buffer = bufferController.buffers[this.bufferIndex]
        src.loop = this.loop
        
        this.ADSRs[key].gain.setValueAtTime(0, 0)
        src.connect(this.ADSRs[key])
    }
}
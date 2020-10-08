






import { NuniSourceNode } from './nuni_source_node.js'
import { NuniAudioParam } from '../nuni_audioparam.js'
import { BufferStorage } from '../../storage/buffer_storage.js'
import { BufferCanvasFrame } from './buffercanvas.js'

type Source = AudioBufferSourceNode

export class BufferNode2 extends NuniSourceNode {
    /**
     * A wrapper around AudioBufferSourceNode that allows
     * it to be played by the keyboard.
     */

    loop : boolean
    private _bufferKey : number
    detune : NuniAudioParam
    playbackRate : NuniAudioParam
    bufferCanvas : BufferCanvasFrame
    loopStart = 0
    loopEnd = 1
    duration = 0
    
    constructor(ctx : AudioContext) {
        super(ctx)

        this.loop = true
        this._bufferKey = 0
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)

        this.kbMode = false
        this.bufferCanvas = new BufferCanvasFrame({
            update: (isStart : boolean, value : number) => {
                if (isStart)
                {
                    this.loopStart = value
                }
                else
                {
                    this.loopEnd = value
                }
                NuniSourceNode.prototype.refresh.call(this)
            }
        })
    }

    set bufferKey(key : number) {
        this._bufferKey = key
        this.refresh()
        this.bufferCanvas.setKey(key)
    }

    get bufferKey() {
        return this._bufferKey
    }
    
    refresh() {
        NuniSourceNode.prototype.refresh.call(this)
        this.bufferCanvas?.setKey(this._bufferKey)
    }

    createSource() {
        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        const reversed = this.loopStart > this.loopEnd
        src.buffer = BufferStorage.get(this._bufferKey, reversed)
        src.loop = this.loop
        src.loopStart = Math.min(this.loopStart, this.loopEnd) * src.buffer.duration
        src.loopEnd = Math.max(this.loopStart, this.loopEnd) * src.buffer.duration

        return src
    }
}
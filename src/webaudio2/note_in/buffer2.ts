






import { NuniSourceNode } from './nuni_source_node.js'
import { NuniAudioParam } from '../nuni_audioparam.js'
import { BufferStorage } from '../../storage/buffer_storage.js'
import { BufferUtils } from '../../buffer_utils/internal.js'

export class BufferNode2 extends NuniSourceNode {
    /**
     * A wrapper around AudioBufferSourceNode that allows
     * it to be played by the keyboard.
     */

    loop : boolean
    private _bufferKey : number
    detune : NuniAudioParam
    playbackRate : NuniAudioParam
    canvas : HTMLCanvasElement
    updateCanvas : Function
    
    constructor(ctx : AudioContext) {
        super(ctx)

        this.loop = true
        this._bufferKey = 0
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)

        this.kbMode = false
        const [canvas,updateCanvas] = createCanvas(this)
        this.canvas = canvas
        this.updateCanvas = updateCanvas
    }

    set bufferKey(key : number) {
        this._bufferKey = key
        this.refresh()
        this.updateCanvas()
    }

    get bufferKey() {
        return this._bufferKey
    }

    createSource() {
        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        src.buffer = BufferStorage.get(this._bufferKey)
        src.loop = this.loop

        return src
    }
}

function createCanvas(audioNode : BufferNode2) : [HTMLCanvasElement, Function] {
    const canvas = E('canvas', { className: 'some-border' })
    const size = 50
    const H = canvas.height = size
    const W = canvas.width = size * 4
    const ctx = canvas.getContext('2d')!
    const updateCanvas = () => {
        const imageData = BufferUtils.getImage(audioNode.bufferKey, ctx, H, W)
        ctx.putImageData(imageData, 0, 0)
    }
    updateCanvas()

    return [canvas, updateCanvas]
}
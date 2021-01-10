






import { NuniSourceNode } from '../../note_in/nuni_source_node.js'
import { BufferStorage } from '../../../storage/buffer_storage.js'
import { BufferCanvasFrame } from './sample_canvas2.js'
import { BufferUtils } from '../../../buffer_utils/internal.js'
import { createToggleButton } from '../../../UI_library/internal.js'

export class NuniSampleNode extends NuniSourceNode 
    implements AudioNodeInterfaces<NodeTypes.SAMPLE> {
    /**
     * A wrapper around AudioBufferSourceNode that allows
     * it to be played by the keyboard.
     */

    loop : boolean
    private _bufferKey : number
    detune : NuniAudioParam
    playbackRate : NuniAudioParam
    bufferCanvas : BufferCanvasFrame
    _loopStart = 0
    _loopEnd = 1

    private _zoomStart = 0
    private _zoomEnd = 1
    
    constructor(ctx : AudioContext) {
        super(ctx)

        this.loop = true
        this._bufferKey = 0
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)

        this.bufferCanvas = new BufferCanvasFrame({
            update: (isStart : boolean, value : number) => {
                if (isStart)
                {
                    this._loopStart = value
                }
                else
                {
                    this._loopEnd = value
                }
                NuniSourceNode.prototype.refresh.call(this)
            },
            updateZoom: (start : number, end : number) => {
                this._zoomStart = start
                this._zoomEnd = end
                NuniSourceNode.prototype.refresh.call(this)
            }
        })
        this.kbMode = false
    }

    set loopStart(value : number) {
        this._loopStart = value
        this.bufferCanvas.updateLoopStartOrEnd(value, true)
        NuniSourceNode.prototype.refresh.call(this)
    }
    get loopStart() { return this._loopStart }

    set loopEnd(value : number) {
        this._loopEnd = value
        this.bufferCanvas.updateLoopStartOrEnd(value, false)
        NuniSourceNode.prototype.refresh.call(this)
    }
    get loopEnd() { return this._loopEnd }

    set bufferKey(key : number) {
        this._bufferKey = key
        this.refresh()
        this.bufferCanvas.setKey(key)
    }
    get bufferKey() { return this._bufferKey }

    set zoomStart(start : number) { 
        this._zoomStart = start
        this.bufferCanvas.setZoom(start, this._zoomEnd) 
        NuniSourceNode.prototype.refresh.call(this)
    }
    get zoomStart() { return this._zoomStart }

    set zoomEnd(end : number) { 
        this._zoomEnd = end
        this.bufferCanvas.setZoom(this._zoomStart, end) 
        NuniSourceNode.prototype.refresh.call(this)
    }
    get zoomEnd() { return this._zoomEnd }

    private resetZoom() {
        this._zoomStart = 0
        this._zoomEnd = 1
        this.bufferCanvas.setZoom(0, 1)
    }

    refresh() {
        NuniSourceNode.prototype.refresh.call(this)
        this.bufferCanvas?.setKey(this._bufferKey)
        this.resetZoom()
    }

    createSource() {
        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        const reversed = this._loopStart > this._loopEnd
        src.buffer = BufferStorage.get(this._bufferKey, reversed)
        src.loop = this.loop

        const duration = src.buffer.duration
        const zoomWidth = this._zoomEnd - this._zoomStart
        const zoomedDuration = zoomWidth * src.buffer.duration

        src.loopStart = (start => reversed ? duration - start : start
        )(this._zoomStart * duration + this._loopStart * zoomedDuration)

        src.loopEnd = (end => reversed ? duration - end : end
        )(this._zoomStart * duration + this._loopEnd * zoomedDuration)

        return src
    }

    getController() {
        const box = E('span', { className: 'buffer-stuff-row' })
    
        const text = String.fromCharCode(65 + this.bufferKey)
        const value = E('span', { className: 'flex-center', text })
        box.appendChild(value)
    
    
        // TODO: change this to a select box, 
        // and don't depend on BufferUtils, 
        // depend on BufferStorage, instead.
        ;['🡄','🡆'].forEach((op,i) => { // change the buffer index
            const btn = E('button', { text: op, className: 'push-button' })
            btn.onclick = () => {
                const key = clamp(0,
                    this.bufferKey + Math.sign(i - .5), 
                    BufferUtils.nBuffers-1)
    
                value.innerText = String.fromCharCode(65 + key)
                this.bufferKey = key
                this.resetZoom()
            }
            box.appendChild(btn)
        })
        
        box.appendChild(createToggleButton(
            this, 
            'loop', 
            { update : (on : boolean) => this.refresh() }
            ))
            
        // box.appendChild(createToggleButton(
        //     this,
        //     'kbMode',
        //     { text: '🎹'
        //     , className: 'kb-button' 
        //     }))
    
        box.appendChild(createToggleButton({}, '⟳', 
            { 
                update : (on : boolean) => { 
                    const [start, end] = [this._loopStart, this._loopEnd]
                    this.loopStart = end
                    this.loopEnd = start
                }
            }))
    
        const container = E('div', 
            { className: 'some-border vert-split'
            , children: [box, this.bufferCanvas.frame] 
            })
        return container
    }
}
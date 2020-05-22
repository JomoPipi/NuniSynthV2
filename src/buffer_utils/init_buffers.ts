






import { NuniGraph } from '../nunigraph/nunigraph.js'
import { audioCtx } from '../webaudio2/webaudio2.js'
import { BufferNode2 } from '../webaudio2/buffer2.js'
import { drawBuffer } from './draw_buffer.js'

const presets = (i:number, channel : number) => ([
    Math.sin(i / 32.0) + Math.sin(i / 512.0),
    Math.sin(i / Math.sqrt(i/3.0)) - Math.cos(i ** 0.3), 
    Math.sin(i / 32.0) * 0.75 + Math.sin(i / 128.0 * channel) * 0.5 + Math.cos(i / (1000/(i**0.9*9+1))) * 0.3,
    Math.sin(i / 32.0 + Math.sin(i / (channel+1))),
    Math.sin(i / Math.tan(i/3.0)),

    Math.sin(i / Math.tan(i/3.0)) - Math.cos(i / 32.0),
    Math.sin(i / Math.sqrt(i/3.0)) * Math.cos(i ** 0.3),
    Math.sin(i / 32.0) + Math.sin(i / 81.0),
    Math.sin(i / 32.0) + Math.sin(i / 25.0),
    Math.sin(i / 32.0) + Math.cos(i / 27.0),
    [...Array(90)].reduce((a,_,n) => a + Math.abs(Math.sin(i/(n * 10))) / 90, 0)
])

export class BufferController {
    static readonly nBuffers = 16;

    g : NuniGraph;
    buffers : AudioBuffer[];
    currentIndex : number;
    lastRecorderRequestId : number;
    stopLastRecorder : Function;
    nextBufferDuration : number;
    constructor(g : NuniGraph) {
        this.g = g
        this.buffers = []
        this.currentIndex = 0
        this.lastRecorderRequestId = 0
        this.stopLastRecorder = id
        this.nextBufferDuration = 10
        this.initBuffers(audioCtx)
        this.refreshAffectedBuffers()
    }

    updateBufferUI() {
        const n = this.currentIndex
        D('buffer-info')!.innerText =
        `${
            String.fromCharCode(65 + n)
        } -- ${
            this.buffers[n].duration
        } seconds`
    
        drawBuffer(
            this.buffers[n], 
            D('buffer-canvas') as HTMLCanvasElement)
    }

    refreshAffectedBuffers() {
        this.updateBufferUI()
        for (const { audioNode: an } of this.g.nodes) {
            if (an instanceof BufferNode2 && an.bufferIndex === this.currentIndex) {
                an.refresh()
            }
        }
    }
    
    initBuffers(ctx : AudioContext) {
        const seconds = 3
        this.buffers.length = 0
        const div = D('buffer-container')!

        for (let n = 0; n < BufferController.nBuffers; n++) {
            const btn = E('button')
            btn.innerText = String.fromCharCode(65+n)
            btn.id = `buff-${n}`
            btn.classList.add('list-btn')
            div.appendChild(btn)

            const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate)
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
                const nowBuffering = buffer.getChannelData(channel)
                for (let i = 0; i < buffer.length; i++) {
                    nowBuffering[i] = presets(i,channel)[n] || (i % 2) / 2.0
                }
            }
            this.buffers.push(buffer)
        }
        
        D('buff-0')!.classList.add('selected2')

        div.onclick = (e : MouseEvent) =>{
            const btn = e.target as HTMLButtonElement
            const [_,n] = btn.id.split('-').map(Number)
            D(`buff-${this.currentIndex}`)?.classList.remove('selected2')
            D(`buff-${n}`)?.classList.add('selected2')
            this.currentIndex = n
            this.updateBufferUI()
        }
    }
}
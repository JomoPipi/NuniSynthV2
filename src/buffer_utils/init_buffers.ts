






import { drawBuffer } from './draw_buffer.js'
import { BufferStorage } from '../storage/general/buffer_storage.js'




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

class BufferUtily {
    
    currentIndex : number;
    lastRecorderRequestId : number;
    stopLastRecorder : Function;
    nextBufferDuration : number;
    nBuffers : number;
    private refreshFunc : Function;

    constructor() {
        this.currentIndex = 0
        this.lastRecorderRequestId = 0
        this.stopLastRecorder = () => void 0
        this.nextBufferDuration = +(D('new-buffer-length') as HTMLSelectElement).value
        this.nBuffers = 26
        this.refreshFunc = (x : never) => x
    }

    updateBufferUI() {
        const n = this.currentIndex
        const buff = BufferStorage.get(n)

        D('buffer-info')!.innerText =
        `${
            String.fromCharCode(65 + n)
        } -- ${
            buff.duration
        } seconds`
    
        drawBuffer(
            buff, 
            D('buffer-canvas') as HTMLCanvasElement)
    }

    refreshAffectedBuffers() {
        this.refreshFunc(this.currentIndex)
    }

    setRefreshBufferFunc(f : Function) {
        this.refreshFunc = f
    }
    
    initBufferPresets(ctx : AudioContext) {
        const _seconds = 0.1
        
        const div = D('buffer-container')!

        for (let n = 0; n < this.nBuffers; n++) {
            const seconds = n === 0 ? 4 : _seconds

            const btn = E('button', {
                text: String.fromCharCode(65+n),
                className: 'list-btn',
                props: { id: `buff-${n}` }
                })
            div.appendChild(btn)

            const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate)
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
                const nowBuffering = buffer.getChannelData(channel)
                for (let i = 1; i < buffer.length; i++) {
                    nowBuffering[i] = presets(i,channel)[n] || (i % 2) / 2.0
                }
            }
            BufferStorage.set(n, buffer)
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

export const BufferUtils = new BufferUtily()
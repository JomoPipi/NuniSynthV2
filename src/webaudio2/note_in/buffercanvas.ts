






import { BufferUtils } from "../../buffer_utils/internal.js"

type Arguments = { onChange : Function }

export class BufferCanvasFrame {
    private nowShowing = 0
    private size = 50
    private H 
    private W 
    private ctx
    frame : HTMLDivElement
    canvas : HTMLCanvasElement
    onChange

    constructor({ onChange } : Arguments) {
        this.frame = E('div', { className: 'center some-border' })
        this.canvas = E('canvas')
        this.H = this.canvas.height = this.size
        this.W = this.canvas.width = this.size * 4
        this.ctx = this.canvas.getContext('2d')!
        
        this.refresh()

        const layer = E('div', { text: '🙂' })
        layer.style.position = 'absolute'
        layer.style.top = '0px'
        layer.style.left = '0%'
        const layer2 = E('div', { text: '🙂' })
        layer2.style.position = 'absolute'
        layer2.style.top = '0px'
        layer2.style.left = '100%'
        
        const shadowRoot = this.frame.attachShadow({mode: 'open'})
        shadowRoot.append(this.canvas, layer, layer2)
        this.onChange = onChange
    }

    setKey(key : number) {
        this.nowShowing = key
        this.refresh()
    }

    private refresh() {
        const imageData = BufferUtils.getImage(
            this.nowShowing, 
            this.ctx, this.H, this.W)
        this.ctx.putImageData(imageData, 0, 0)
    }
}
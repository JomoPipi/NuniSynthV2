






import { BufferUtils } from "../../buffer_utils/internal.js"

export class BufferCanvas {
    private nowShowing = 0
    private size = 50
    private H 
    private W 
    private ctx
    canvas : HTMLCanvasElement

    constructor() {
        this.canvas = E('canvas', { className: 'some-border' })
        this.H = this.canvas.height = this.size
        this.W = this.canvas.width = this.size * 4
        this.ctx = this.canvas.getContext('2d')!
        this.refresh()
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
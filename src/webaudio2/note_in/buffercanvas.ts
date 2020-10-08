






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
        this.frame = E('div', { className: 'center' })

        const shadowRoot = this.frame.attachShadow({ mode: 'open' })
        shadowRoot.innerHTML = `<style>
        :host {
            position: relative;
            background-color: red;
        }
        .slice {
            position: absolute;
            cursor: grab;
            bottom: 0%;
        }
        .left { 
            right: 100%;
        }
        .right { 
            left: 100%;
            transform: scale(-1, 1);
        }
        canvas {
            width: 100%;
        }
        </style>
        
        <canvas id="canvas"></canvas>
        <div id="right"class="slice right">🔪</div>
        <div id="left" class="slice left" >🔪</div>
        <slot></slot>`

        const left = shadowRoot.getElementById('left')!
        const right = shadowRoot.getElementById('right')!
        const canvas = shadowRoot.getElementById('canvas')! as 
            HTMLCanvasElement

        log('righleft =',right.innerText, left.innerHTML)

        this.frame.onmousedown = (e : MouseEvent) => {
            log(e.x)
            log(this.canvas.offsetWidth)
        }

        this.canvas = canvas
        this.H = this.canvas.height = this.size
        this.W = this.canvas.width = this.size * 4
        this.ctx = this.canvas.getContext('2d')!
        this.refresh()

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
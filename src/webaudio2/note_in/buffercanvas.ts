






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
        canvas {
            width: 100%;
        }
        .slice {
            position: absolute;
            cursor: grab;
            bottom: 0%;
        }
        .slice:active {
            cursor: grabbing;
        }
        .left { 
            right: 100%;
        }
        .right { 
            left: 100%;
            transform: scale(-1, 1);
        }
        .panel {
            height: 100%;
            background: rgba(100,100,100,0.5);
            position: absolute;
            top: 0;
        }
        .left-panel {
            left: 0;
        }
        </style>
        
        <canvas id="canvas"></canvas>
        <div id="left" class="slice left" >🔪</div>
        <div id="right"class="slice right">🔪</div>

        <div id="left-panel" class="panel right-panel" ></div>
        <div id="right-panel"class="panel left-panel"></div>
        <slot></slot>`

        const left = shadowRoot.getElementById('left')!
        const right = shadowRoot.getElementById('right')!
        const lPanel = shadowRoot.getElementById('panel left-panel')!
        const rPanel = shadowRoot.getElementById('panel right-panel')!
        const canvas = shadowRoot.getElementById('canvas')! as 
            HTMLCanvasElement

        log('righleft =',right.innerText, left.innerHTML)

        this.frame.onmousedown = (e : MouseEvent) => {
            const targ = e.target
            if (targ === left || targ === right)
            {
                this.frame.onmousemove = (e : MouseEvent) => {
                    const width = this.canvas.offsetWidth
                    const percent = e.offsetX/width
                    if (targ === left)
                    {
                        const val = width * percent
                        log('val =',val)
                        lPanel.style.width = val + 'px'
                    }
                }
                
                this.frame.onmouseup = () => {
                    this.frame.onmousemove = null
                }
            }
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
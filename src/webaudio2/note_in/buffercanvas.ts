






import { BufferUtils } from "../../buffer_utils/internal.js"
import { doUntilMouseUp } from "../../UI_library/events/until_mouseup.js"

type Arguments = { update : Function }

export class BufferCanvasFrame {
    private nowShowing = 0
    private size = 50
    private H 
    private W 
    private ctx
    frame : HTMLDivElement
    canvas : HTMLCanvasElement

    constructor({ update } : Arguments) {
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
            background: rgba(0, 0, 0, 0.5);
            position: absolute;
            top: 0;
            pointer-events: none;
        }
        .left-panel {
            left: 0;
        }
        </style>
        
        <canvas id="canvas"></canvas>
        <div id="left-panel" class="panel right-panel" ></div>
        <div id="right-panel"class="panel left-panel"></div>
        <div id="left" class="slice left" >🔪</div>
        <div id="right"class="slice right">🔪</div>`

        const left = shadowRoot.getElementById('left')!
        const right = shadowRoot.getElementById('right')!
        const lPanel = shadowRoot.getElementById('left-panel')!
        const rPanel = shadowRoot.getElementById('right-panel')!
        const canvas = shadowRoot.getElementById('canvas')! as 
            HTMLCanvasElement

        left.onmousedown = doUntilMouseUp(mousemove(true), { mouseup: mouseup(true) })
        right.onmousedown = doUntilMouseUp(mousemove(false), { mouseup: mouseup(false) })

        function mouseup(grabbingLeftSlicer : boolean) {
            return (e : MouseEvent) => {
                const x = e.x - canvas.getBoundingClientRect().left
                const width = canvas.offsetWidth
                const percent = clamp(0, x/width, 1)
                update(grabbingLeftSlicer, percent)
            }
        }

        function mousemove(grabbingLeftSlicer : boolean) {
            return function(e : MouseEvent) {
                const x = e.x - canvas.getBoundingClientRect().left
                const width = canvas.offsetWidth
                const percent = clamp(0, x/width, 1)
                const val = width * percent

                if (grabbingLeftSlicer) 
                {
                    lPanel.style.width = val + 'px'
                    left.style.right = (width - val) + 'px'
                }
                else 
                {
                    rPanel.style.width = (width - val) + 'px'
                    rPanel.style.left = val + 'px'
                    right.style.left = val + 'px'
                }
            }
        }

        this.canvas = canvas
        this.H = this.canvas.height = this.size
        this.W = this.canvas.width = this.size * 5
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
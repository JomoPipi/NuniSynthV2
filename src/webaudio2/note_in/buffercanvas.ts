






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
    left : HTMLElement
    right : HTMLElement
    lPanel : HTMLElement
    rPanel : HTMLElement
    shadowRoot : ShadowRoot

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

        this.lPanel = shadowRoot.getElementById('left-panel')!
        this.rPanel = shadowRoot.getElementById('right-panel')!
        this.left = shadowRoot.getElementById('left')!
        this.right = shadowRoot.getElementById('right')!
        const canvas = this.canvas = shadowRoot.getElementById('canvas')! as 
            HTMLCanvasElement

        function mouseup(grabbingLeftSlicer : boolean) {
            return (e : MouseEvent) => {
                const x = e.x - canvas.getBoundingClientRect().left
                const width = canvas.offsetWidth
                const percent = clamp(0, x/width, 1)
                update(grabbingLeftSlicer, percent)
            }
        }

        const mousemove = (grabbingLeftSlicer : boolean) => {
            return (e : MouseEvent) => {
                const x = e.x - canvas.getBoundingClientRect().left
                const width = canvas.offsetWidth
                const val = clamp(0, x, width)

                this.updateSlicers(grabbingLeftSlicer, val, width - val)
            }
        }

        this.left.onmousedown = doUntilMouseUp(mousemove(true), { mouseup: mouseup(true) })
        this.right.onmousedown = doUntilMouseUp(mousemove(false), { mouseup: mouseup(false) })

        this.H = canvas.height = this.size
        this.W = canvas.width = this.size * 5
        this.ctx = canvas.getContext('2d')!
        this.refresh()

        this.shadowRoot = shadowRoot
    }

    updateSlicers(leftSlicer : boolean, val : number, _val : number) {
        if (leftSlicer) 
        {
            this.lPanel.style.width = val + 'px'
            this.left.style.right = _val + 'px'
        }
        else 
        {
            this.rPanel.style.width = _val + 'px'
            this.rPanel.style.left = val + 'px'
            this.right.style.left = val + 'px'
        }
    }

    updateLoopStartOrEnd(value : number, start : boolean) {
        const width = this.canvas.offsetWidth

        if (width === 0)
        {
            // We need to get notified when the shadowRoot gets connected to the dom tree
            // TODO: Optimize, if possible.
            const observer = new MutationObserver(mutations => {
                this.updateLoopStartOrEnd(value, start)
                observer.disconnect()
            })
            observer.observe(document, { subtree: true, childList: true })
            return;
        }
        const val = value * width
        const _val = width - val
        this.updateSlicers(start, val, _val)
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
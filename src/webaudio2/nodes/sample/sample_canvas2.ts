






import { BufferUtils } from "../../../buffer_utils/internal.js"
import { doUntilMouseUp } from "../../../UI_library/events/until_mouseup.js"

type Arguments = 
    { update(grabbingLeft : boolean, percent : number) : void
    , updateZoom(start : number, end : number) : void
    }

export class BufferCanvasFrame {
/*  All this does is show a picture of a sample, and allows you to drag the
    start and and end points of it.
*/
    private nowShowing = 0
    private size = 50
    private H 
    private W = 30
    private ctx
    frame : HTMLDivElement
    private left : HTMLElement
    private right : HTMLElement
    private lPanel : HTMLElement
    private rPanel : HTMLElement

    private zoomStart = 0
    private zoomEnd = 1

    constructor({ update, updateZoom } : Arguments) {
        const canvas = E('canvas', { className: 'sample-canvas' })
        this.frame = E('div', { className: 'center sample-canvas-frame' })
        this.lPanel = E('div', { className: 'panel left-panel' })
        this.rPanel = E('div', { className: 'panel right-panel' })
        this.left = E('div', { className: 'slice left', text: '🔪' })
        this.right = E('div', { className: 'slice right', text: '🔪' })

        this.frame.append(canvas, this.lPanel, this.rPanel, this.left, this.right)

        const KNIFE_WIDTH = 20
        let canvasLeft : number = 0
        let canvasWidth : number = 0
        let deltaX : number = 0
        const mousedown  = (grabbingLeftSlicer : boolean) =>
            (e : MouseEvent) => {
                deltaX = (KNIFE_WIDTH - e.offsetX) * (grabbingLeftSlicer ? -1 : 1)
                canvasLeft = canvas.getBoundingClientRect().left
                canvasWidth = canvas.offsetWidth
            }

        const mousemove = (grabbingLeftSlicer : boolean) => {
            return (e : MouseEvent) => {
                const val = clamp(0, e.x - canvasLeft - deltaX, canvasWidth)
                this.updateSlicers(grabbingLeftSlicer, val, canvasWidth - val)
            }
        }

        function mouseup(grabbingLeftSlicer : boolean) {
            return (e : MouseEvent) => {
                const x = e.x - canvasLeft - deltaX
                const percent = clamp(0, x / canvasWidth, 1)
                update(grabbingLeftSlicer, percent)
            }
        }

        this.left.onmousedown = doUntilMouseUp( 
            { mousedown: mousedown(true)
            , mousemove: mousemove(true)
            , mouseup: mouseup(true)
            })

        this.right.onmousedown = doUntilMouseUp(
            { mousedown: mousedown(false)
            , mousemove: mousemove(false)
            , mouseup: mouseup(false)
            })

        this.H = canvas.height = this.size
        this.W = canvas.width = this.size * SPECIAL_NUM | 0
        this.frame.style.maxWidth = this.W + 'px'
        this.ctx = canvas.getContext('2d')!
        this.refresh()

        this.frame.onwheel = (e : WheelEvent) => {
            const direction = -Math.sign(e.deltaY)
            const zoomCenter = (this.zoomStart + this.zoomEnd) / 2.0
            const mouseLeft = e.offsetX / this.W
            const mouseRight = 1 - mouseLeft
            this.zoomStart = clamp(0, this.zoomStart +
                (zoomCenter - this.zoomStart) * mouseLeft * direction / 4.0, 1)

            this.zoomEnd = clamp(0, this.zoomEnd - 
                (zoomCenter - this.zoomStart) * mouseRight * direction / 4.0, 1)

            updateZoom(this.zoomStart, this.zoomEnd)
            this.refresh()
        }
    }

    setZoom(start : number, end : number) {
        this.zoomStart = start
        this.zoomEnd = end
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
        const val = value * this.W
        const _val = this.W - val
        this.updateSlicers(start, val, _val)
    }

    setKey(key : number) {
        this.nowShowing = key
    }

    refresh() {
        const imageData = BufferUtils.getImage2(
            this.nowShowing, 
            this.ctx, this.H, this.W, this.zoomStart, this.zoomEnd)
        this.ctx.putImageData(imageData, 0, 0)
    }
}
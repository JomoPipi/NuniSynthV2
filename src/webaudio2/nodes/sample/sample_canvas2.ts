






import { BufferUtils } from "../../../buffer_utils/internal.js"
import { doUntilMouseUp } from "../../../UI_library/events/until_mouseup.js"

type Arguments = { update(grabbingLeft : boolean, percent : number) : void }

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

    constructor({ update } : Arguments) {
        const canvas = E('canvas')
        this.frame = E('div', { className: 'center sample-canvas-frame' })
        this.lPanel = E('div', { className: 'panel left-panel' })
        this.rPanel = E('div', { className: 'panel right-panel' })
        this.left = E('div', { className: 'slice left', text: '🔪' })
        this.right = E('div', { className: 'slice right', text: '🔪' })
        this.frame.append(canvas,this.lPanel,this.rPanel,this.left,this.right)

        let canvasLeft : number = 0
        let canvasWidth : number = 0
        function mousedown (e : MouseEvent) {
            canvasLeft = canvas.getBoundingClientRect().left
            canvasWidth = canvas.offsetWidth
        }

        const mousemove = (grabbingLeftSlicer : boolean) => {
            return (e : MouseEvent) => {
                const val = clamp(0, e.x - canvasLeft, canvasWidth)
                this.updateSlicers(grabbingLeftSlicer, val, canvasWidth - val)
            }
        }

        function mouseup(grabbingLeftSlicer : boolean) {
            return (e : MouseEvent) => {
                const x = e.x - canvasLeft
                const percent = clamp(0, x / canvasWidth, 1)
                update(grabbingLeftSlicer, percent)
            }
        }

        this.left.onmousedown = doUntilMouseUp(mousemove(true), 
            { mousedown
            , mouseup: mouseup(true) 
            })

        this.right.onmousedown = doUntilMouseUp(mousemove(false), 
            { mousedown
            , mouseup: mouseup(false)
            })

        const FC = 4.669201609102990671853203820466
        this.H = canvas.height = this.size
        this.W = canvas.width = this.size * FC | 0
        this.ctx = canvas.getContext('2d')!
        this.refresh()
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
        this.refresh()
    }

    private refresh() {
        const imageData = BufferUtils.getImage(
            this.nowShowing, 
            this.ctx, this.H, this.W)
        this.ctx.putImageData(imageData, 0, 0)
    }
}
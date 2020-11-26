






import { doUntilMouseUp } from "../../UI_library/events/until_mouseup.js";
import { NuniGraphAudioNode } from "../../webaudio2/internal.js"

export function createResizeableGraphEditor(audioNode : NuniGraphAudioNode) {
    const box = E('div')
    const { canvas } = audioNode

    const topRow = E('div', { className: 'full' }); topRow.style.height = '5px'
    const leftEdge = E('div', { className: 'ew-edge-drag' })
    const rightEdge = E('div', { className: 'ew-edge-drag' })
    const middleRowContainer = E('div', { className: 'draggable-row' })
    const bottomRow = E('div', { className: 'resizeable-window-bottom-row' })
    const dragCorner = E('div', { className: 'nwse-corner-drag-box' })
    const dragCornernesw = E('div', { className: 'nesw-corner-drag-box' })
    const bottomMiddleEdge = E('span')
        
    bottomRow.append(dragCornernesw, bottomMiddleEdge, dragCorner)
    
    const NONE = 0, VERTICAL = 1, HORIZONTAL = 2
    const state = 
        { xy: [0,0]
        , wh: [0,0]
        , resizeDirection: 0
        , doLeft: false
        , canvasMinWidth: Infinity
        }

    box.onmousedown = doUntilMouseUp(mousemove, { mousedown })

    requestAnimationFrame(() => audioNode.controller.renderer.updateNodeRadius())

    function mousedown(e : MouseEvent) {

        state.doLeft = [leftEdge, dragCornernesw].includes(e.target as HTMLDivElement)

        state.resizeDirection =
        e.target === dragCorner || 
        e.target === dragCornernesw
            ? 3
            : e.target === rightEdge || e.target === leftEdge
            ? HORIZONTAL
            : e.target === bottomMiddleEdge 
            ? VERTICAL
            : NONE

        if (state.resizeDirection === NONE) return;

        state.xy = [e.clientX, e.clientY]
        state.wh = [canvas.offsetWidth, canvas.offsetHeight]

        // Set the canvas' min width
        const w = canvas.width
        canvas.width = 0
        state.canvasMinWidth = canvas.offsetWidth
        canvas.width = w
    }
    
    function mousemove(e : MouseEvent) {
        // This is here to prevent the `render` (at the bottom) from interfering with
        // the render function from GraphController.prototype.mousemove
        // You can see this for yourself if you comment this out and 
        // try make connections within a module.
        if (state.resizeDirection === NONE) return;
        
        const [X,Y] = [e.clientX, e.clientY]
        const [x,y] = state.xy
        const [w,h] = state.wh
        
        const factor = PHI + 0.35

        if (state.resizeDirection & HORIZONTAL) 
        {
            if (state.doLeft)
            {
                // To prevent moving the container, 
                // we must not go lower than the min width
                // X <= w + x - minWidth
                const _X = Math.min(X, w + x - state.canvasMinWidth)

                canvas.parentElement!.parentElement!
                    .parentElement!.parentElement!.parentElement!
                    .style.left = _X + 'px'

                canvas.width = Math.max(0, w + x - _X)
                canvas.height = canvas.width / factor
            }
            else
            {
                canvas.width = Math.max(0, w + X - x)
                canvas.height = canvas.width / factor
            }
        }
        if (state.resizeDirection & VERTICAL) 
        {
            canvas.height = Math.max(0, h + Y - y)
            canvas.width = canvas.height * factor
        }

        audioNode.controller.renderer.updateNodeRadius()

        // if (state.resizeDirection & HORIZONTAL) 
        // {
        //     if (state.doLeft)
        //     {
        //         // To prevent moving the container, 
        //         // we must not go lower than the min width
        //         // X <= w + x - minWidth
        //         const _X = Math.min(X, w + x - state.canvasMinWidth)

        //         canvas.parentElement!.parentElement!
        //             .parentElement!.parentElement!.parentElement!
        //             .style.left = _X + 'px'

        //         canvas.width = Math.max(0, w + x - _X)
        //     }
        //     else
        //     {
        //         canvas.width = Math.max(0, w + X - x)
        //     }
        // }
        // if (state.resizeDirection & VERTICAL) 
        // {
        //     canvas.height = Math.max(0, h + Y - y)
        // }

        audioNode.controller.renderer.render()
    }

    middleRowContainer.append(leftEdge, canvas, rightEdge)
    box.append(topRow, middleRowContainer, bottomRow)

    // It needs to render after the HTML is appended to the document
    requestAnimationFrame(() => audioNode.controller.renderer.render())

    return box
}







import { doUntilMouseUp } from "../events/until_mouseup.js";







export function createResizeableWindow(content : HTMLElement, ancestor : HTMLElement, resizeCallback? : any) {
    const box = E('div')
    const canvas = content

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
    let xy : number[], wh : number[]
    let resizeDirection = 0
    let doLeft = false
    let canvasMinWidth = Infinity
    
    box.onmousedown = doUntilMouseUp(mousemove, { mousedown, mouseup: resizeCallback })

    function mousedown(e : MouseEvent) {
        doLeft = [leftEdge, dragCornernesw].includes(e.target as HTMLDivElement)

        resizeDirection =
        e.target === dragCorner || 
        e.target === dragCornernesw
            ? 3
            : e.target === rightEdge || e.target === leftEdge
            ? HORIZONTAL
            : e.target === bottomMiddleEdge 
            ? VERTICAL
            : NONE

        if (resizeDirection === NONE) return;

        xy = [e.clientX, e.clientY]
        wh = [canvas.offsetWidth, canvas.offsetHeight]

        // Set the canvas' min width
        const w = canvas.style.width
        canvas.style.width = '0px'
        canvasMinWidth = canvas.offsetWidth
        canvas.style.width = w
    }

    function mousemove(e : MouseEvent) {

        if (resizeDirection === NONE) return;
        
        const [X,Y] = [e.clientX, e.clientY]
        const [x,y] = xy
        const [w,h] = wh
        
        if (resizeDirection & HORIZONTAL) 
        {
            if (doLeft)
            {
                // To prevent moving the container, 
                // we must not go lower than the min width
                // X <= w + x - minWidth
                const _X = Math.min(X, w + x - canvasMinWidth)

                // canvas.parentElement!.parentElement!
                //     .parentElement!.parentElement!.parentElement!
                ancestor
                    .style.left = _X + 'px'

                canvas.style.width = Math.max(0, w + x - _X) + 'px'
            }
            else
            {
                canvas.style.width = Math.max(0, w + X - x) + 'px'
            }
        }
        if (resizeDirection & VERTICAL) 
        {
            canvas.style.height = Math.max(0, h + Y - y) + 'px'
        }

    }

    middleRowContainer.append(leftEdge, canvas, rightEdge)
    box.append(topRow, middleRowContainer, bottomRow)

    return box
}
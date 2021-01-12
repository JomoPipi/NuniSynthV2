






import { doUntilMouseUp } from "../events/until_mouseup.js";

type ResizeFunc = (H : number, W : number) => void

export function addResizability(
    box : HTMLElement, 
    resizeCallback : ResizeFunc, 
    children : HTMLElement[]) {

    const dialogBox = E('div', { children })
    dialogBox.style.overflow = 'hidden'
    
    const topRow = E('div', { className: 'resizable-window-bottom-row' })
    const topLeftCorner = E('div', { className: 'nwse-corner-drag-box' })
    const topMiddleEdge = E('span')
    const topRightCorner = E('div', { className: 'nesw-corner-drag-box' })

    const middleRowContainer = E('div', { className: 'draggable-row' })
    const leftEdge = E('div', { className: 'ew-edge-drag' })
    const rightEdge = E('div', { className: 'ew-edge-drag' })

    const bottomRow = E('div', { className: 'resizable-window-bottom-row' })
    const bottomLeftCorner = E('div', { className: 'nesw-corner-drag-box' })
    const bottomMiddleEdge = E('span')
    const bottomRightCorner = E('div', { className: 'nwse-corner-drag-box' })
        
    topRow.append(topLeftCorner, topMiddleEdge, topRightCorner)
    middleRowContainer.append(leftEdge, dialogBox, rightEdge)
    bottomRow.append(bottomLeftCorner, bottomMiddleEdge, bottomRightCorner)

    const NONE = 0, VERTICAL = 1, HORIZONTAL = 2
    let xy : number[], wh : number[]
    let resizeDirection = 0
    let doLeft = false
    let doTop  = false
    let H = 0
    let W = 0
    
    box.onmousedown = doUntilMouseUp(mousemove, 
        { mousedown
        , 
            mouseup: () => {
                if (resizeDirection === NONE) return;
                resizeCallback(H, W)
            }
        })

    function mousedown(e : MouseEvent) {
        const target = e.target as HTMLDivElement
        doTop = [topLeftCorner, topMiddleEdge, topRightCorner].includes(target)
        doLeft = [leftEdge, bottomLeftCorner, topLeftCorner].includes(target)

        resizeDirection =
        [topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner].includes(target)
            ? 3
            : target === rightEdge || target === leftEdge
            ? HORIZONTAL
            : target === topMiddleEdge || target === bottomMiddleEdge 
            ? VERTICAL
            : NONE

        if (resizeDirection === NONE) return;

        xy = [e.clientX, e.clientY]
        wh = [dialogBox.offsetWidth, dialogBox.offsetHeight]
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
                const _X = Math.min(X, w + x)

                box
                    .style.left = _X + 'px'

                W = Math.max(0, w + x - _X)
                dialogBox.style.width = W + 'px'
            }
            else
            {
                W = Math.max(0, w + X - x)
                dialogBox.style.width = W + 'px'
            }
        }
        if (resizeDirection & VERTICAL) 
        {
            if (doTop)
            {
                const _Y = Math.min(Y, h + y)
                box
                    .style.top = _Y + 'px'

                H = Math.max(0, h + y - _Y)
                dialogBox.style.height = H + 'px'
            }
            else
            {
                H = Math.max(0, h + Y - y)
                dialogBox.style.height = H + 'px'
            }
        }
    }

    return [topRow, middleRowContainer, bottomRow]
}
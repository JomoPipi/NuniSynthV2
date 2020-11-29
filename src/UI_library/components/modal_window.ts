






import { doUntilMouseUp } from "../events/until_mouseup.js"
import { rgbaColorContrast } from "../functions/colorContrast.js"
import { UI_clamp } from "../functions/ui_clamp.js"





type ModalWindowOptions = {
    text : string
    clickCallback : (box : HTMLElement) => void
    closeCallback : (box : HTMLElement) => void
    color : string
    barContent? : HTMLElement
    contentContainer : HTMLElement
    }

export function createModalWindow(
    { text, clickCallback, closeCallback, color, barContent, contentContainer } : ModalWindowOptions) {

    const innerBox = E('div')
    const outerBox = E('div', { className: 'window show' })

    const topRowContainer = E('div', { className: 'resizeable-window-bottom-row' })
    const middleRowContainer = E('div', { className: 'draggable-row' })
    const bottomRowContainer = E('div', { className: 'resizeable-window-bottom-row' })

    const topLeftCorner = E('div', { className: 'nwse-corner-drag-box' })
    const topMiddleEdge = E('span')
    const topRightCorner = E('div', { className: 'nesw-corner-drag-box' })

    const leftEdge = E('div', { className: 'ew-edge-drag' })
    const rightEdge = E('div', { className: 'ew-edge-drag' })

    const bottomLeftCorner = E('div', { className: 'nesw-corner-drag-box' })
    const bottomRightCorner = E('div', { className: 'nwse-corner-drag-box' })
    const bottomMiddleEdge = E('span')
        
    topRowContainer.append(topLeftCorner, topMiddleEdge, topRightCorner)
    middleRowContainer.append(leftEdge, innerBox, rightEdge)
    bottomRowContainer.append(bottomLeftCorner, bottomMiddleEdge, bottomRightCorner)

    outerBox.append(topRowContainer, middleRowContainer, bottomRowContainer)

    outerBox.style.left = '50vw'
    outerBox.style.top = '50vh'

    const exitBtn = E('button', { text: 'x', className: 'exit-button' })
    const bar = E('div', { text: text + ' ', className: 'draggable-window-bar' })

    if (barContent) bar.appendChild(barContent)
    bar.appendChild(exitBtn)

    innerBox.append(bar, contentContainer)

    bar.style.backgroundColor = color || '#555'
    bar.style.color = rgbaColorContrast(color) || '#555'

    exitBtn.onclick = closeCallback.bind(null, outerBox)

    addDragFunction(bar, outerBox, clickCallback)
    
    // Let the window be displayed if someone clicks on it.
    outerBox.onmousedown = clickCallback.bind(null, outerBox)




    //** RESIZE FUNCTIONALITY **//
    const NONE = 0, VERTICAL = 1, HORIZONTAL = 2, BOTH = 3
    let xy : number[], wh : number[]
    let resizeDirection = 0
    let doLeft = false
    let doTop  = false
    let canvasMinWidth = Infinity
    
    outerBox.onmousedown = doUntilMouseUp(mousemove, { mousedown }) //, mouseup: resizeCallback })

    return outerBox

    function mousedown(e : MouseEvent) {
        doLeft = [leftEdge, bottomLeftCorner, topLeftCorner].includes(e.target as HTMLDivElement)
        doTop  = [topLeftCorner, topMiddleEdge, topRightCorner].includes(e.target as HTMLDivElement)

        resizeDirection =
        [topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner].includes(e.target as HTMLDivElement)
            ? BOTH
            : e.target === rightEdge || e.target === leftEdge
            ? HORIZONTAL
            : e.target === topMiddleEdge || e.target === bottomMiddleEdge
            ? VERTICAL
            : NONE

        if (resizeDirection === NONE) return;

        xy = [e.clientX, e.clientY]
        wh = [innerBox.offsetWidth, innerBox.offsetHeight]

        // Set the content' min width
        const w = innerBox.style.width
        innerBox.style.width = '0px'
        canvasMinWidth = innerBox.offsetWidth
        innerBox.style.width = w
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

                outerBox.style.left = _X + 'px'

                innerBox.style.width = Math.max(0, w + x - _X) + 'px'
            }
            else
            {
                innerBox.style.width = Math.max(0, w + X - x) + 'px'
            }
        }
        if (resizeDirection & VERTICAL) 
        {
            if (doTop)
            {
                console.log('yo im here')
                const _Y = Math.min(Y, h + y - 100) // 100 = canvasMinHeight

                outerBox.style.top = _Y + 'px'

                innerBox.style.height = Math.max(0, h + y - _Y) + 'px'
            }
            else
            {
                // innerBox.style.width = Math.max(0, w + X - x) + 'px'
                innerBox.style.height = Math.max(0, h + Y - y) + 'px'
            }
        }

    }
}

function addDragFunction(bar : HTMLElement, box : HTMLElement, clickCallback : Function) {
    
    const state = { coords: [0] }

    bar.onmousedown = doUntilMouseUp(mousemove, { mousedown })

    function mousedown(e : MouseEvent) {
        state.coords = 
            [ e.clientX 
            , e.clientY
            , box.offsetLeft + box.offsetWidth/2 
            , box.offsetTop + box.offsetHeight/2
            ]

        clickCallback(box)
    }

    function mousemove(e : MouseEvent) {
        const [x, y, bx, by] = state.coords
        UI_clamp(
            e.clientX + bx - x,
            e.clientY + by - y,
            box,
            document.body,
            { disableClamp: 2 })
    }
}


// export function createResizeableWindow(content : HTMLElement, ancestor : HTMLElement, resizeCallback? : any) {
//     const box = E('div')

//     const topRow = E('div', { className: 'full' }); topRow.style.height = '5px'
//     const leftEdge = E('div', { className: 'ew-edge-drag' })
//     const rightEdge = E('div', { className: 'ew-edge-drag' })
//     const middleRowContainer = E('div', { className: 'draggable-row' })
//     const bottomRow = E('div', { className: 'resizeable-window-bottom-row' })
//     const dragCorner = E('div', { className: 'nwse-corner-drag-box' })
//     const dragCornernesw = E('div', { className: 'nesw-corner-drag-box' })
//     const bottomMiddleEdge = E('span')
        
//     bottomRow.append(dragCornernesw, bottomMiddleEdge, dragCorner)
//     middleRowContainer.append(leftEdge, content, rightEdge)
//     box.append(topRow, middleRowContainer, bottomRow)

//     const NONE = 0, VERTICAL = 1, HORIZONTAL = 2
//     let xy : number[], wh : number[]
//     let resizeDirection = 0
//     let doLeft = false
//     let canvasMinWidth = Infinity
    
//     box.onmousedown = doUntilMouseUp(mousemove, { mousedown, mouseup: resizeCallback })

//     function mousedown(e : MouseEvent) {
//         doLeft = [leftEdge, dragCornernesw].includes(e.target as HTMLDivElement)

//         resizeDirection =
//         e.target === dragCorner || 
//         e.target === dragCornernesw
//             ? 3
//             : e.target === rightEdge || e.target === leftEdge
//             ? HORIZONTAL
//             : e.target === bottomMiddleEdge 
//             ? VERTICAL
//             : NONE

//         if (resizeDirection === NONE) return;

//         xy = [e.clientX, e.clientY]
//         wh = [content.offsetWidth, content.offsetHeight]

//         // Set the content' min width
//         const w = content.style.width
//         content.style.width = '0px'
//         canvasMinWidth = content.offsetWidth
//         content.style.width = w
//     }

//     function mousemove(e : MouseEvent) {

//         if (resizeDirection === NONE) return;
        
//         const [X,Y] = [e.clientX, e.clientY]
//         const [x,y] = xy
//         const [w,h] = wh
        
//         if (resizeDirection & HORIZONTAL) 
//         {
//             if (doLeft)
//             {
//                 // To prevent moving the container, 
//                 // we must not go lower than the min width
//                 // X <= w + x - minWidth
//                 const _X = Math.min(X, w + x - canvasMinWidth)

//                 // content.parentElement!.parentElement!
//                 //     .parentElement!.parentElement!.parentElement!
//                 ancestor
//                     .style.left = _X + 'px'

//                 content.style.width = Math.max(0, w + x - _X) + 'px'
//             }
//             else
//             {
//                 content.style.width = Math.max(0, w + X - x) + 'px'
//             }
//         }
//         if (resizeDirection & VERTICAL) 
//         {
//             content.style.height = Math.max(0, h + Y - y) + 'px'
//         }

//     }

//     return box
// }







// export function createResizeableGraphEditor(audioNode) {
//     const box = E('div')
//     const { canvas } = audioNode

//     const topRow = E('div', { className: 'full' }); topRow.style.height = '5px'
//     const leftEdge = E('div', { className: 'ew-edge-drag' })
//     const rightEdge = E('div', { className: 'ew-edge-drag' })
//     const middleRowContainer = E('div', { className: 'draggable-row' })
//     const bottomRow = E('div', { className: 'resizeable-window-bottom-row' })
//     const dragCorner = E('div', { className: 'nwse-corner-drag-box' })
//     const dragCornernesw = E('div', { className: 'nesw-corner-drag-box' })
//     const bottomMiddleEdge = E('span')
        
//     bottomRow.append(dragCornernesw, bottomMiddleEdge, dragCorner)

//     const NONE = 0, VERTICAL = 1, HORIZONTAL = 2
//     let xy : number[], wh : number[]
//     let resizeDirection = 0
//     let doLeft = false
//     let canvasMinWidth = Infinity

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
//         wh = [canvas.offsetWidth, canvas.offsetHeight]

//         window.addEventListener('mousemove', mousemove)
//         window.addEventListener('mouseup', mouseup)

//         // Set the canvas' min width
//         const w = canvas.width
//         canvas.width = 0
//         canvasMinWidth = canvas.offsetWidth
//         canvas.width = w
//     }

//     function mousemove(e : MouseEvent) {
        
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

//                 canvas.parentElement!.parentElement!
//                     .parentElement!.parentElement!.parentElement!
//                     .style.left = _X + 'px'

//                 canvas.width = Math.max(0, w + x - _X)
//             }
//             else
//             {
//                 canvas.width = Math.max(0, w + X - x)
//             }
//         }
//         if (resizeDirection & VERTICAL) 
//         {
//             canvas.height = Math.max(0, h + Y - y)
//             canvas.height = Math.max(0, h + Y - y)
//         }

//         audioNode.controller.renderer.render()
//     }

//     function mouseup(e : MouseEvent) {
        
//         window.removeEventListener('mousemove', mousemove)
//         window.removeEventListener('mouseup', mouseup)
//     }
    
//     // dragCorner.onmousedown = mousedown
//     box.onmousedown = mousedown

//     middleRowContainer.append(leftEdge, canvas, rightEdge)
//     box.append(topRow, middleRowContainer, bottomRow)

//     // It needs to render after the HTML is appended to the document
//     requestAnimationFrame(() => audioNode.controller.renderer.render())

//     return box
// }
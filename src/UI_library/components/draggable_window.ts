






import { applyStyle } from "../functions/apply_style.js"
import { rgbaColorContrast } from "../functions/colorContrast.js"
import { UI_clamp } from "../functions/ui_clamp.js"







export function createDraggableWindow({
    text, 
    clickCallback, 
    closeCallback,
    color,
    content
} : {

    text : string, 
    clickCallback : (box : HTMLElement) => void,
    closeCallback : (box : HTMLElement) => void
    color : string
    content? : HTMLElement
    }) {

    const box = E('div',{
        className: 'window show'
        })
    box.style.left = '50vw'
    box.style.top = '50vh'

    const bar = E('div', { text })
    const exitBtn = E('button', { text: 'x' })

    box.appendChild(bar)

    applyStyle(bar, {
        height: '30px',
        width: '100%',
        background: color || '#555',
        color: rgbaColorContrast(color||'#555'),
        cursor: 'move',
        paddingLeft: '5px',
        boxSizing: 'border-box'
        })

    applyStyle(exitBtn, {
        cursor: 'pointer',
        border: '0.2px solid #444',
        boxSizing: 'border-box',
        backgroundColor: 'inherit',
        color: 'inherit',
        height: '30px',
        width: '30px',
        float: 'right',
        textAlign: 'center',
        lineHeight: '30px'
        })

    if (content) bar.appendChild(content)

    bar.appendChild(exitBtn)

    const closeBox = () => closeCallback(box)
    exitBtn.onclick = closeBox

    addDragFunction(bar, box, clickCallback)

    box.appendChild(E('div')) // content box

    // box.appendChild(windowResizer())

    return box
}

function addDragFunction(bar : HTMLElement, box : HTMLElement, clickCallback : Function) {
    
    let coords = [] as number[]

    const mouseup = (e : MouseEvent) => {
        coords = []
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    const mousedown = function(e : MouseEvent) {
        if (e.target === bar) {
            coords = [
                e.clientX, 
                e.clientY,
                box.offsetLeft + box.offsetWidth/2, 
                box.offsetTop + box.offsetHeight/2
                ]
        }

        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)

        clickCallback(box)
    }

    const mousemove = function(e : MouseEvent) {

        if (coords.length) {
            const [x, y, bx, by] = coords
            UI_clamp(
                e.clientX + bx - x,
                e.clientY + by - y,
                box,
                document.body)
        }
    }

    box.onmousedown = mousedown
}




// function windowResizer() {
    
//     const bar = E('div')
//     const resizeHandle = E('span')

//     applyStyle(bar, {
//         height: '15px',
//         width: '100%',
//         background: '#333',
//         // color: rgbaColorContrast('#555'),
//         cursor: 'move',
//         paddingLeft: '5px',
//         boxSizing: 'border-box',
//         position: 'absolute',
//         bottom: '0'
//         })

//     applyStyle(resizeHandle, {
//         cursor: 'nwse-resize',
//         border: '0.2px solid #444',
//         boxSizing: 'border-box',
//         backgroundColor: 'inherit',
//         color: 'inherit',
//         height: '15px',
//         width: '15px',
//         float: 'right',
//         textAlign: 'center',
//         lineHeight: '15px'
//         })

//     bar.appendChild(resizeHandle)
//     resizeHandle.innerText = '//'

//     addResizeFunction(resizeHandle)

//     return bar
// }


// function addResizeFunction(resizeHandle : HTMLElement) {

//     const mouseup = (e : MouseEvent) => {
//         window.removeEventListener('mousemove',mousemove)
//         window.removeEventListener('mouseup',mouseup)
//     }

//     const mousedown = function(e : MouseEvent) {
//         window.addEventListener('mousemove',mousemove)
//         window.addEventListener('mouseup',mouseup)
//     }

//     const mousemove = function(e : MouseEvent) {
//         const box = resizeHandle.parentElement!.parentElement!
//         box.style.right = (window.innerWidth - e.clientX) + 'px'
//         box.style.bottom = (window.innerHeight - e.clientY) + 'px'
//     }

//     resizeHandle.onmousedown = mousedown
// }
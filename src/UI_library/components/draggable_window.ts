






import { doUntilMouseUp } from "../events/until_mouseup.js"
import { rgbaColorContrast } from "../functions/colorContrast.js"
import { UI_clamp } from "../functions/ui_clamp.js"





type DraggableWindowOptions = {
    text : string
    clickCallback : (box : HTMLElement) => void
    closeCallback : (box : HTMLElement) => void
    color : string
    contentContainer : HTMLElement
    barContent? : HTMLElement
    }

export function createDraggableWindow(
    { text, clickCallback, closeCallback, contentContainer, color, barContent } : DraggableWindowOptions) {

    const bar = E('div', { text: text + ' ', className: 'draggable-window-bar' })
    const exitBtn = E('button', { text: 'x', className: 'exit-button' })
    const box = E('div', { className: 'window show', children: [bar, contentContainer] })

    box.style.left = '50vw'
    box.style.top = '50vh'

    bar.style.backgroundColor = color || '#555'
    bar.style.color = rgbaColorContrast(color || '#555')


    if (barContent) bar.append(barContent)
    bar.appendChild(exitBtn)

    exitBtn.onclick = closeCallback.bind(null, box)

    addDragFunction(bar, box, clickCallback)
    
    // Let the window be displayed if someone clicks on it.
    box.onmousedown = clickCallback.bind(null, box)

    return box
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







import { doUntilMouseUp } from "../events/until_mouseup.js"
import { rgbaColorContrast } from "../functions/colorContrast.js"
import { UI_clamp } from "../functions/ui_clamp.js"





type DraggableWindowOptions = {
    clickCallback : (box : HTMLElement) => void
    closeCallback : (box : HTMLElement) => void
    color : string
    contentContainer : HTMLElement
    barContent : HTMLElement
    }

export function createDraggableWindow(
    { clickCallback, closeCallback, contentContainer, color, barContent } : DraggableWindowOptions) {

    const exitBtn = E('button', { text: 'x', className: 'exit-button' })
    const bar = E('div', { className: 'draggable-window-bar', children: [barContent, exitBtn] })
        // bar.style.border = '1px solid gold'
    const box = E('div', { className: 'window show', children: [bar, contentContainer] })

    // box.style.border = `2px solid ${color}`
    // box.style.borderLeft =
    // box.style.borderRight =
    box.style.borderBottom = `1px solid ${color}`
    // bar.style.backgroundColor = color || '#555'
    // bar.style.color = rgbaColorContrast(color || '#555')

    exitBtn.onclick = closeCallback.bind(null, box)

    addDragFunction(bar, box, clickCallback)
    
    // Let the window be displayed if someone clicks on it.
    box.onmousedown = clickCallback.bind(null, box)

    return box
}

function addDragFunction(bar : HTMLElement, box : HTMLElement, clickCallback : Function) {
    
    const state = { coords: [0], nodrag: false }

    bar.onmousedown = doUntilMouseUp(mousemove, { mousedown })

    function mousedown(e : MouseEvent) {
        state.coords = 
            [ e.clientX 
            , e.clientY
            , box.offsetLeft + box.offsetWidth/2 
            , box.offsetTop + box.offsetHeight/2
            ]

        state.nodrag = (e.target as HTMLElement)?.classList.contains('no-drag')

        clickCallback(box)
    }

    function mousemove(e : MouseEvent) {
        if (state.nodrag) return;
        
        const [x, y, bx, by] = state.coords
        UI_clamp(
            e.clientX + bx - x,
            e.clientY + by - y,
            box,
            document.body,
            { disableClamp: 2 })
    }
}
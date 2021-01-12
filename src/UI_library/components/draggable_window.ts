






import { doUntilMouseUp } from "../events/until_mouseup.js"
import { rgbaColorContrast } from "../functions/colorContrast.js"
import { UI_clamp } from "../functions/ui_clamp.js"
import { addResizability } from "./add_resizability.js"





type DraggableWindowOptions = {
    clickCallback : (box : HTMLElement) => void
    closeCallback : (box : HTMLElement) => void
    color : string
    contentContainer : HTMLElement
    barContent : HTMLElement
    resizeUpdate? : (H : number, W : number) => void
}

export function createDraggableWindow(
    { clickCallback
    , closeCallback
    , contentContainer
    , color, barContent
    , resizeUpdate 
    } : DraggableWindowOptions) {

    const exitBtn = E('button', { text: 'x', className: 'exit-button no-drag' })
    const bar = E('div', { className: 'draggable-window-bar', children: [barContent, exitBtn] })

    const box = E('div', { className: 'window show' })
        // box.style.backgroundColor = 'transparent' // TROLL

    const children = resizeUpdate
        ? addResizability(box, resizeUpdate, [bar, contentContainer])
        : [bar, contentContainer]

    // Let the window be displayed if someone clicks on it.
    box.onclick = clickCallback.bind(null, box)
    box.append(...children)
    box.style.borderBottom = `1px solid ${color}`

    exitBtn.onclick = closeCallback.bind(null, box)
    addDragFunction(bar, box, clickCallback)

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
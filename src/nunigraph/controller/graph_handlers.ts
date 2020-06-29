






import { GraphController } from '../init.js'
import { NuniGraphController } from './graph_controller.js'



const contextmenu = D('graph-contextmenu')!

// Set-up the graph contextmenu
{
    D('nuni-logo')!.onclick = (e : MouseEvent) =>
        GraphController.showContextMenu(e.clientX, e.clientY)
        

    const append = (type : NodeTypes, color : string) => {

        const create = () => {

            const controller = DIRTYGLOBALS.lastControllerToOpenTheContextmenu || GraphController as NuniGraphController
            

            controller.save()
            const node = controller.g.createNewNode(type)
            const menu = contextmenu
            
            if (menu.style.display !== 'none') {
                // Place the newly created node where the contextmenu was.
                const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = 
                    controller === GraphController 
                    ? controller.renderer.canvas
                    : controller.renderer.canvas.parentNode.parentNode.parentNode.parentNode

                node.x = clamp(0, (menu.offsetLeft - offsetLeft + menu.offsetWidth / 2.0) / offsetWidth, 1)
                node.y = clamp(0, (menu.offsetTop - offsetTop + menu.offsetHeight / 2.0) / offsetHeight, 1)
                controller.hideContextMenu()
            }
            
            controller.renderer.render()
            DIRTYGLOBALS.lastControllerToOpenTheContextmenu = undefined
        }

        const colorbox = E('span')
        applyStyle(colorbox, {
            display: 'inline-block',
            width: '18px',
            height: '18px',
            float: 'right',
            opacity: 0.5,
            margin: '2px',
            marginLeft: '20px',
            background: color
            })
    
        const textbox = E('span', { text: type })

        const btn = E('button', { 
            className: 'list-btn', 
            children: [textbox, colorbox],
            props: { onclick: create }
            })

        contextmenu.appendChild(btn)
    }

    for (const key in NodeTypes) {
        const type = (<Indexed>NodeTypes)[key] as NodeTypes
        append(type, NodeTypeColors[type])
    }
}

// // Right-click options
// D('nunigraph-canvas')!.oncontextmenu = function(e : MouseEvent) {
//     e.preventDefault()
//     GraphController.showContextMenu(e.clientX, e.clientY)
// }

// Copy the graph
;(D('copy-graph-button') as HTMLButtonElement).onclick = function() {
    (D('graph-copy-output') as HTMLInputElement).value = GraphController.g.toString()
}

// Create graph from string
;(D('from-string-button') as HTMLButtonElement).onclick = function() {
    const input = D('graph-copy-input') as HTMLInputElement
    try { 
        GraphController.save()
        GraphController.fromString(input.value)
        GraphController.renderer.render()
        input.value = ''
    } catch (e) {
        GraphController.undo()
        input.value = 'Invalid code'
    }
}

// Undo / redo btns
;(D('graph-undo-redo-btns') as HTMLElement).onclick = function(e : MouseEvent) {
    const undoBtnId = 'graph-undo-button'
    const redoBtnId = 'graph-redo-button'
    const id = (<HTMLElement>e.target).id
    
    if (id === undoBtnId) {
        GraphController.undo()
        GraphController.renderer.render()
    } else if (id === redoBtnId) {
        GraphController.redo()
        GraphController.renderer.render()
    }
}
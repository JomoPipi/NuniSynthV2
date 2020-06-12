






import { G, GraphController } from '../init.js'
import MasterClock from '../../webaudio2/sequencers/master-clock.js';




// Create Nodes
{
    const append = (type : NodeTypes, color : string) => {

        const create = () => {
            GraphController.save()
            const node = G.createNewNode(type)
            const menu = D('graph-contextmenu')!
            
            if (menu.style.display !== 'none') {
                // Place the newly created node where the contextmenu was.
                const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = 
                    GraphController.renderer.canvas
                node.x = clamp(0, (menu.offsetLeft - offsetLeft + menu.offsetWidth / 2.0) / offsetWidth, 1)
                node.y = clamp(0, (menu.offsetTop - offsetTop + menu.offsetHeight / 2.0) / offsetHeight, 1)
                GraphController.hideContextMenu()
            }
            
            GraphController.renderer.render()
        }


        const btn = E('button')
            btn.classList.add('list-btn')
            btn.onclick = create

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
    
        const textbox = E('span')
        textbox.innerText = type

        btn.append(textbox, colorbox)
        D('graph-contextmenu')!.appendChild(btn)
    }

    for (const key in NodeTypes) {
        const type = (<Indexed>NodeTypes)[key] as NodeTypes
        append(type, NodeTypeColors[type])
    }

}

// Copy the graph
;(D('copy-graph-button') as HTMLButtonElement).onclick = function() {
    (D('graph-copy-output') as HTMLInputElement).value = G.toString()
}

// Create graph from string
;(D('from-string-button') as HTMLButtonElement).onclick = function() {
    const input = D('graph-copy-input') as HTMLInputElement
    try { 
        GraphController.save()
        G.fromString(input.value)
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

// Clear the graph
;(D('clear-graph-button') as HTMLButtonElement).onclick = function() {
    GraphController.save()
    G.clear()
    GraphController.renderer.render()
}

// Right-click options
D('nunigraph-canvas')!.oncontextmenu = function(e : MouseEvent) {
    e.preventDefault()
    GraphController.showContextMenu(e.clientX, e.clientY)
}

// Create Graph-legend
// {
//     const legend = D('nunigraph-legend')!
//     const append = (text : string, color : string) => {
//         const colorbox = E('span')
//         const textbox = E('span')
//         colorbox.style.background = color
//         textbox.innerText = text
//         legend.appendChild(colorbox)
//         legend.appendChild(textbox)
//     }
//     append('master-gain', MasterGainColor)
//     for (const key in NodeTypes) {
//         const type = (<Indexed>NodeTypes)[key] as NodeTypes
//         append(type, NodeTypeColors[type])
//     }
// }

// Add tempo input
{

    const input = createDraggableNumberInput(
        120,
        
        () => MasterClock.tempo,

        (delta : number, value : number) =>
            (MasterClock.tempo = clamp(20, value + delta, 999)).toFixed(0),

        (value : number) => 
            MasterClock.tempo = value 
    )
    input.style.width = '100px'
    D('tempo-input-container')!.appendChild(input)
}


// export function showGraphContextMenu(x : number, y : number) {
//     const menu = D('graph-contextmenu') as HTMLDivElement

//     menu.style.display = 'grid'
//     UI_clamp(x, y, menu, document.body)
// }

// export function hideGraphContextmenu() {
//     D('graph-contextmenu')!.style.display = 'none'
// }
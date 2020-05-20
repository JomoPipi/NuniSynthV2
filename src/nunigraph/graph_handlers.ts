






import { G, GraphController } from './init.js'
import { GraphUndoRedoModule } from  './graph_undo_redo.js'

// Create Nodes
Object.values(NodeTypes).forEach(type => {
    const create = () => {
        GraphUndoRedoModule.save()
        const node = G.newNode(type)
        const menu = D('graph-contextmenu')!
        
        if (menu.style.display !== 'none') {
            // Place the newly created node where the contextmenu was.
            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = 
                GraphController.renderer.canvas
            node.x = clamp(0, (menu.offsetLeft - offsetLeft + menu.offsetWidth / 2.0) / offsetWidth, 1)
            node.y = clamp(0, (menu.offsetTop - offsetTop + menu.offsetHeight / 2.0) / offsetHeight, 1)
            hideGraphContextmenu()
        }
        
        GraphController.renderer.render()
    }
    D(`create-${type}`)!.onclick = create 
    D(`create-${type}2`)!.onclick = create
})

// Copy the graph
;(D('copy-graph-button') as HTMLButtonElement).onclick = function() {
    (D('graph-copy-output') as HTMLInputElement).value = G.toString()
}

// Create graph from string
;(D('from-string-button') as HTMLButtonElement).onclick = function() {
    const input = D('graph-copy-input') as HTMLInputElement
    try { 
        GraphUndoRedoModule.save()
        G.fromString(input.value)
        GraphController.renderer.render()
        input.value = ''
    } catch (e) {
        GraphUndoRedoModule.undos.pop()
        input.value = 'Invalid code'
    }
}

// Undo / redo btns
;(D('graph-undo-redo-btns') as HTMLElement).onclick = function(e : MouseEvent) {
    const undoBtnId = 'graph-undo-button'
    const redoBtnId = 'graph-redo-button'
    const id = (<HTMLElement>e.target).id
    
    if (id === undoBtnId) {
        GraphUndoRedoModule.undo()
        GraphController.renderer.render()
    } else if (id === redoBtnId) {
        GraphUndoRedoModule.redo()
        GraphController.renderer.render()
    }
}

// Clear the graph
;(D('clear-graph-button') as HTMLButtonElement).onclick = function() {
    GraphUndoRedoModule.save()
    G.clear()
    GraphController.renderer.render()
}

// Right-click options
D('nunigraph-canvas')!.oncontextmenu = function(e : MouseEvent) {
    e.preventDefault()
    showGraphContextMenu(e.clientX, e.clientY)
}

// Create Graph-legend
{
    const legend = D('nunigraph-legend')!
    const append = (text : string, color : string) => {
        const colorbox = E('span')
        const textbox = E('span')
        colorbox.style.background = color
        textbox.innerText = text
        legend.appendChild(colorbox)
        legend.appendChild(textbox)
    }
    append('master-gain', MasterGainColor)
    for (const key in NodeTypes) {
        const type = (<Indexed>NodeTypes)[key] as NodeTypes
        append(type, NodeTypeColors[type])
    }
}


export function showGraphContextMenu(x : number, y : number) {
    const menu = D('graph-contextmenu') as HTMLDivElement

    menu.style.display = 'grid'
    UI_clamp(x, y, menu, document.body)
}

export function hideGraphContextmenu() {
    D('graph-contextmenu')!.style.display = 'none'
}
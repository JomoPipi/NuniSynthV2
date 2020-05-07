






// Create Nodes
Object.values(NodeTypes).forEach(type => {
    const create = () => {
        UndoRedoModule.save()
        const node = G.newNode(type)
        const menu = D('graph-contextmenu')!
        log('display =',menu.style.display)
        if (menu.style.display !== 'none') {
            // Place the newly created node where the contextmenu was.
            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = GraphCanvas.canvas
            node.x = clamp(0, (menu.offsetLeft - offsetLeft + menu.offsetWidth / 2.0) / offsetWidth, 1)
            node.y = clamp(0, (menu.offsetTop - offsetTop + menu.offsetHeight / 2.0) / offsetHeight, 1)
            hideGraphContextmenu()
        }

        GraphCanvas.render()
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
        UndoRedoModule.save()
        G.fromString(input.value)
        GraphCanvas.render()
        input.value = ''
    } catch (e) {
        UndoRedoModule.undos.pop()
        input.value = 'Invalid code'
    }
}

// Clear the graph
;(D('clear-graph-button') as HTMLButtonElement).onclick = function() {
    UndoRedoModule.save()
    G.clear()
    GraphCanvas.render()
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


function showGraphContextMenu(x : number, y : number) {
    const menu = D('graph-contextmenu') as HTMLDivElement

    menu.style.display = 'grid'
    UI_clamp(x, y, menu, document.body)
}

function hideGraphContextmenu() {
    D('graph-contextmenu')!.style.display = 'none'
}
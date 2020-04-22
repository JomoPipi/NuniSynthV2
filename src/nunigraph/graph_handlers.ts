






// Create Nodes
Object.values(NodeTypes).forEach(type => {
    const create = () => {
        UndoRedoModule.save()
        const node = G.newNode(type)
        const menu = D('graph-contextmenu')!

        if (menu.style.display !== 'none') {
            // Place the newly created node in an appriopriate location near the mouse
            const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = GraphCanvas.canvas
            node.x = (menu.offsetLeft - offsetLeft) / offsetWidth
            node.y = (menu.offsetTop - offsetTop) / offsetHeight
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

function showGraphContextMenu(x : number, y : number) {
    const menu = D('graph-contextmenu') as HTMLDivElement
    menu.style.display = 'grid'
    menu.style.top  = y+'px'
    menu.style.left = x+'px'
}
function hideGraphContextmenu() {
    D('graph-contextmenu')!.style.display = 'none'
}







// Create Nodes
Object.values(NodeTypes).forEach(type => {
    const create = () => {
        G.newNode(type)
        GraphCanvas.render()
        hideGraphContextmenu()
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
        G.fromString(input.value)
        input.value = ''
    } catch (e) {
        input.value = 'Invalid code'
    }
}

// right-click options
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

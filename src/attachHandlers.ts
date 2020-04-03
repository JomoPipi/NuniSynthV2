// create [NodeType] buttons
Object.values(NodeTypes).forEach(type => {
    D('create-' + type)!.onclick = () => {
        G.newNode(type, null)
        GraphCanvas.render()
    }
})

// copy the graph
;(D('copy-graph-button') as HTMLButtonElement).onclick = function() {
    (D('graph-copy-output') as HTMLInputElement).value = G.toString()
}

// create graph from string
;(D('from-string-button') as HTMLButtonElement).onclick = function() {
    const input = D('graph-copy-input') as HTMLInputElement
    try { 
        G.fromString(input.value)
        input.value = ''
    } catch (e) {
        input.value = 'Invalid code'
    }
}

// help the user
D('about')!.onclick = () =>
    window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')


// Inject (or hide) HTML that allows manipulation of the selected node
G.selectNodeFunc = () => {

    const node = G.selectedNode as NuniGraphNode
    const controls = D('injected-node-value-ui') as HTMLDivElement

    controls.innerHTML = ''
    D('node-options')!.style.gridTemplateColumns = node ? '1fr 1fr' : '1fr'
        
    if (!node) return;

    controls.appendChild(showSubtypes(node))
    
    controls.appendChild(exposeAudioParams(node))

    const deleteNode = E('button')
    deleteNode.innerHTML = 'delete this node'
    deleteNode.style.float = 'right'
    deleteNode.onclick = _ => G.deleteSelectedNode()
    controls.append(deleteNode)
}




function showSubtypes(node : NuniGraphNode) : Node {
    const subtypes = AudioNodeSubTypes[node.type]
    const box = E('div')
    if (subtypes.length > 0) { // show subtypes selector
        const select = E('select') as HTMLSelectElement
        for (const t of subtypes) {
            const op = E('option') as HTMLOptionElement
            op.value = op.innerHTML = t
            select.appendChild(op)
        }
        select.value = node.audioNode.type
        select.oninput = function() {
            node.audioNodeType = 
            node.audioNode.type = select.value
        }
        box.appendChild(select)
        box.appendChild(E('span'))
    }
    return box
}




function exposeAudioParams(node : NuniGraphNode) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        box.classList.add('box')

        const paramName = E('span')
        paramName.innerHTML = param
        box.appendChild(paramName)

        box.appendChild(createDraggableNumberInput(node,param))

        allParams.appendChild(box)
    }
    return allParams
}




function createDraggableNumberInput(node : NuniGraphNode, param : AudioParamString) {
    const valueInput = E('input') as HTMLInputElement
    valueInput.type = 'number'
    valueInput.classList.add('number-grab')
    valueInput.value = node.audioParamValues[param].toPrecision(5)

    let lastPos = -1
    const canvasHandler = GraphCanvas.canvas.onmousemove

    const mousedown = function(e : MouseEvent) {
        lastPos = e.clientX + e.clientY / 100.0
        GraphCanvas.canvas.onmousemove = null
        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)
    }

    const mousemove = function(e : MouseEvent) {
        const leftClickHeld = e.buttons === 1
        if (!leftClickHeld) return;

        const pos       = e.clientX - e.clientY / 100.0
        const delta     = sliderFactor[param]
        const [min,max] = AudioParamRanges[param]
        const value     = node.audioParamValues[param]
        const useLinear = hasLinearSlider[param] || value === 0
        const factor    = useLinear ? pos - lastPos : lastPos > pos ? -value : value
        const newValue  = clamp(min, value + factor * delta, max)

        valueInput.value = newValue.toPrecision(5)
        node.setValueOfParam(param, newValue)
        lastPos = pos
    }

    const mouseup = () => {
        lastPos = -1
        GraphCanvas.canvas.onmousemove = canvasHandler
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    valueInput.onmousedown = mousedown
    return valueInput
}
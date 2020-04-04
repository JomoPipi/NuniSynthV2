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
    const subtypes = AudioNodeSubTypes[node.type] as string[]
    const box = E('div')
    if (subtypes.length > 0) { // show subtypes selector
        const select = E('select') as HTMLSelectElement
        
        insertOptions(select, subtypes)
        select.value = node.audioNode.type
        select.oninput = function() {
            node.audioNodeType = 
            node.audioNode.type = select.value
        }
        box.appendChild(select)
        box.appendChild(E('span')) // to maintain structure
    }
    return box
}




function insertOptions(select : HTMLSelectElement, options : string[]) {
    select.innerHTML = 
        options.map(type => `<option>${type}</option>`).join('')
}




function exposeAudioParams(node : NuniGraphNode) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        box.classList.add('box')

        box.innerHTML = `<span>${param}</span>`

        const initialValue = node.audioParamValues[param].toPrecision(5)
        const updater = createUpdateParamFunc(node,param)
        const manualUpdater = (x:number) => node.setValueOfParam(param, x)
        box.appendChild(createDraggableNumberInput(initialValue, updater, manualUpdater))

        allParams.appendChild(box)
    }
    return allParams
}




function createUpdateParamFunc(node : NuniGraphNode, param : AudioParamString) {
    return (delta : number) : string => {

        const amount    = sliderFactor[param]
        const [min,max] = AudioParamRanges[param]
        const value     = node.audioParamValues[param]
        const useLinear = hasLinearSlider[param] || value === 0
        const factor    = useLinear ? delta : Math.sign(delta) * value
        const newValue  = clamp(min, value + factor * amount, max)

        node.setValueOfParam(param, newValue)
        return newValue.toPrecision(5)
    }
}




function createDraggableNumberInput(initialValue: string, updateFunc: (delta:number) => string, manualUpdater: (value:number) => void ) {
    const valueInput = E('input') as HTMLInputElement
    valueInput.type = 'number'
    valueInput.classList.add('number-grab')
    valueInput.value = initialValue
    
    // needs to be temporarily disabled so the user doesn't interact with the canvas
    const canvasHandler = GraphCanvas.canvas.onmousemove 

    let lastPosition : number

    const mousedown = function(e : MouseEvent) {
        lastPosition = e.clientX - e.clientY / 64.0
        GraphCanvas.canvas.onmousemove = null
        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)
    }

    const mousemove = function(e : MouseEvent) {
        if (e.buttons !== 1) return;
        const position = e.clientX - e.clientY / 64.0
        valueInput.value = updateFunc(position - lastPosition)
        lastPosition = position
    }

    const mouseup = () => {
        GraphCanvas.canvas.onmousemove = canvasHandler
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    valueInput.onmousedown = mousedown
    valueInput.oninput = () => manualUpdater(+valueInput.value)
    return valueInput
}
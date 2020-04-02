const buttons = [...document.getElementsByClassName('new-node-btns')] as HTMLButtonElement[]
buttons.forEach(btn => {
    btn.onclick = () => {
        G.newNode(btn.id.split('-')[1] as NodeTypes, null)
        GraphCanvas.render()
    }
})

D('copy-graph-button')!.onclick = function() {
    (D('graph-copy-output') as HTMLInputElement).value = G.toString()
}

D('from-string-button')!.onclick = function() {
    const input = D('graph-copy-input') as HTMLInputElement
    try { 
        G.fromString(input.value)
        input.value = ''
    } catch (e) {
        input.value = 'Invalid code'
    }
}

D('about')!.onclick = () =>
    window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')




G.selectNodeFunc = () => {
    /** Injects HTML that allows manipulation of the selected node. **/

    const E = (x:string) => document.createElement(x)
    const node = G.selectedNode as NuniGraphNode
    const controls = D('injected-node-value-ui')!

    controls.innerHTML = ''
    D('node-options')!.style.gridTemplateColumns = node ? '1fr 1fr' : '1fr'
        
    if (!node) return;

    const subtypes = AudioNodeSubTypes[node.type]
    
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
        controls.appendChild(select)
        controls.appendChild(E('span'))
    }
    
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        box.classList.add('box')

        const paramName = E('span')
        paramName.innerHTML = param

        const paramValue = E('input') as HTMLInputElement
        paramValue.type = 'number'
        paramValue.classList.add('number-grab')
        paramValue.value = node.audioParamValues[param].toString()
        paramValue.oninput = function() {
            node.setValueOfParam(param, +paramValue.value)
        }
        let lastPos = -1
        paramValue.onmousemove = function(e) {
            const leftClickHeld = e.buttons === 1
            if (!leftClickHeld) return;

            const pos = e.clientX 
            if (lastPos < 0) lastPos = pos
            
            const delta     = sliderFactor[param]
            const [min,max] = AudioParamRanges[param]
            const value     = node.audioParamValues[param]
            const useLinear = hasLinearSlider[param] || value === 0
            const factor    = useLinear ? pos - lastPos : lastPos > pos ? -value : value
            const newValue  = clamp(min, value + factor * delta, max)

            paramValue.value = newValue.toString()
            node.setValueOfParam(param, newValue)
            lastPos = pos
        }
        paramValue.onmouseup = () => lastPos = -1

        box.appendChild(paramName)
        box.appendChild(paramValue)
        controls.appendChild(box)
    }

    const deleteNode = E('button')
    deleteNode.innerHTML = 'delete this node'
    deleteNode.style.float = 'right'
    deleteNode.onclick = _ => G.deleteSelectedNode()
    controls.append(deleteNode)
}
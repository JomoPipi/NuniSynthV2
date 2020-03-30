const buttons = [...document.getElementsByClassName('new-node-btns')] as HTMLButtonElement[]
buttons.forEach(btn => {
    btn.onclick = () => {
        G.newNode(btn.id.split('-')[1] as NodeTypes, null)
        GraphCanvas.render()
    }
})


D('connect-node')!.onclick = function() {
    if (!G.selectedNode) {
        alert('Please select a node first')
        return;
    }
    G.isPromptingUserToSelectConnectee = true

    GraphCanvas.render()
}

D('copy-graph-button')!.onclick = function() {
    (D('graph-copy-output') as HTMLInputElement).value = G.toString()
}

D('from-string-button')!.onclick = function() {
    const input = D('graph-copy-input') as HTMLInputElement
    try { 
        G.fromString(input.value)
        input.value = ''
    } catch (e) {
        input.value = 'invalid code'
    }
}

D('about')!.onclick = () =>
    window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')














































G.selectNodeFunc = () => {
    /** Injects HTML that allows manipulation of the selected node. **/

    const E = (x:string) => document.createElement(x)
    const node = G.selectedNode as NuniGraphNode

    D('connect-node')!.style.display = node ?
        'inline' : 'none'

    const controls = D('injected-node-value-ui')!
    controls.innerHTML = ''

    D('node-options')!.style.gridTemplateColumns = node ?
        '1fr 1fr' : '1fr'
        
    if (!node) return;

    const subtypes = AudioNodeSubTypes[node.type]
    
    if (subtypes.length > 0) {
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
    }
    
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')

        const span = E('span')
        span.innerHTML = param

        const input = E('input') as HTMLInputElement
        input.type = 'number'
        input.classList.add('number-grab')
        input.value = node.audioParamValues[param].toString()
        input.oninput = function() {
            G.selectedNode!.setValueOfParam(param, +input.value)
        }
        let x = 0
        input.onmousemove = function(e) {
            if (e.buttons === 1) {
                input.classList.add('number-grabbing')
                const pos = e.clientX 
                if (!x) x = pos

                const delta = sliderFactor[param]
                const [min,max] = AudioParamRanges[param]
                
                const newV = 
                    Math.min(max, Math.max(min, 
                        hasLinearSlider[param] ||
                        G.selectedNode!.audioNode[param].value === 0 ? 
                        // exponential won't work with 0 or panning
                            node.audioParamValues[param] + (pos - x) * delta
                        :
                            (x > pos ? 1-delta : 1+delta) * node.audioParamValues[param] ))

                input.value = newV.toString()
                G.selectedNode!.setValueOfParam(param, newV)
                x = pos
            }
            else
                input.classList.remove('number-grabbing')
        }
        input.onmouseup = () => x = 0

        box.appendChild(span)
        box.appendChild(input)
        controls.appendChild(box)
    }
    const deleteNode = E('button')
    deleteNode.innerHTML = 'delete this node'
    deleteNode.style.float = 'right'
    deleteNode.onclick = _ => G.deleteSelectedNode()
    controls.append(deleteNode)
}



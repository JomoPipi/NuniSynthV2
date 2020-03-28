
;[...document.getElementsByClassName('new-node-btns')]
    .forEach((btn:any) => {
        btn.onclick = () => {
            G.newNode(btn.id.split('-')[1], null)
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














































G.selectNodeFunc = () => {

    // INJECT HTML
    D('connect-node')!.style.display = G.selectedNode ?
        'inline' : 'none'

    const E = (x:string) => document.createElement(x)
    const node = G.selectedNode as NuniGraphNode
    const controls = D('injected-node-value-ui')!
    controls.innerHTML = ''
    if (!node) {
        return;
    }

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
        input.value = node[param].value
        input.oninput = function() {
            G.selectedNode.setValueOfParam(param, +input.value)
        }
        let x = 0
        input.onmousemove = function(e) {
            if (e.buttons === 1) {
                input.classList.add('number-grabbing')
                const pos = e.clientX 
                if (!x) x = pos
                const newV = Math.min(20000, Math.max(0, node[param].value + (pos - x) * 0.1))
                input.value = newV.toString()
                G.selectedNode.setValueOfParam(param, newV)
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
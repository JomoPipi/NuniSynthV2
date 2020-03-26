
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

G.selectNodeFunc = () => {
    const E = (x:string) => document.createElement(x)
    const node = G.selectedNode
    const controls = D('injected-node-value-ui')!
    controls.innerHTML = ''
    if (!node) {
        return;
    }
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        const span = E('span')
        span.innerHTML = param
        const input = E('input') as HTMLInputElement
        input.type = 'number'
        input.value = node[param].value
        input.oninput = function() {
            G.selectedNode.setValueOfParam(param, +input.value)
        }
        box.appendChild(span)
        box.appendChild(input)
        controls.appendChild(box)
    }
    const deleteNode = E('button')
    deleteNode.innerHTML = 'delete this node'
    deleteNode.onclick = _ => G.deleteSelectedNode()
    controls.append(deleteNode)
}
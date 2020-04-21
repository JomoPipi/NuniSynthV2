






// Inject (or hide) HTML that allows manipulation of the selected node
G.selectNodeFunc = () => {
    const node = G.selectedNode as NuniGraphNode
    const container = D('node-value-container')!

    container.style.display = node ? 'grid' : 'none'
    if (!node) return;

    container.innerHTML = ''
    const controls = E('div')
    container.appendChild(controls)

    if (node.audioNode instanceof NuniSourceNode) {
        controls.appendChild(showKeyboardConnection(node.audioNode))
    }
    
    controls.appendChild(showSubtypes(node))

    if (node.audioNode instanceof BufferNode2) {
        controls.appendChild(samplerControls(node.audioNode))
    }

    controls.appendChild(exposeAudioParams(node))

    // Add delete button
    if (node.id === 0) return; // Don't delete the master gain node
    const deleteNode = E('button')
    deleteNode.innerHTML = 'delete this node'
    deleteNode.style.float = 'right'
    deleteNode.onclick = _ => {
        G.deleteSelectedNode()
        G.unselectNode()
    }
    controls.append(deleteNode)
}




function showKeyboardConnection(audioNode : NuniSourceNode) : Node {
    const types = ['none','mono','poly']
    const select = E('select') as HTMLSelectElement
    const box = E('div'); box.innerHTML = 'keyboard: '
    
    insertOptions(select, types)
    select.value = audioNode.kbMode
    select.oninput = function() {
        audioNode.setKbMode(select.value as KbMode)
    }
    box.appendChild(select)
    return box
}




function showSubtypes(node : NuniGraphNode) : Node {
    const subtypes = AudioNodeSubTypes[node.type] as string[]
    const box = E('div')
    if (subtypes.length > 0) { // Show subtypes selector
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




function samplerControls(audioNode : BufferNode2) {
    const box = E('div')
    // box.classList.add('box')
    box.innerHTML = '<span> buffer </span>'
    const value = E('span'); value.innerHTML = audioNode.bufferIndex.toString()
    box.appendChild(value)

    ;['-','+'].forEach((op,i) => { // change the buffer index
        const btn = E('button'); btn.innerHTML = op
        btn.onclick = () => {
            const v = clamp(0, audioNode.bufferIndex + Math.sign(i - .5), nBuffers-1)

            value.innerHTML = v.toString()
            audioNode.bufferIndex = v
            audioNode.refresh()
        }
        box.appendChild(btn)
    })
 
    ;['loop'].forEach(text => { // toggleable buttons
        const btn = E('button'); btn.innerHTML = text
        btn.classList.toggle('selected',(audioNode as Indexed)[text])
        btn.onclick = () => {
            const on = (audioNode as Indexed)[text] ^= 1
            btn.classList.toggle('selected', <any>on)
            audioNode.refresh()
        }
        box.appendChild(btn)
    })

    // const length = E('span')

    return box
}




function exposeAudioParams(node : NuniGraphNode) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        box.classList.add('box')

        box.innerHTML = `<span>${param}</span>`

        const initialValue = node.audioParamValues[param]
        const updater = createUpdateParamFunc(node,param)
        const mousedownFunc = () => node.audioParamValues[param]
        const manualUpdater = (x:number) => node.setValueOfParam(param, x)
        box.appendChild(createDraggableNumberInput(initialValue, mousedownFunc, updater, manualUpdater))

        allParams.appendChild(box)
    }
    return allParams
}




function createUpdateParamFunc(node : NuniGraphNode, param : AudioParams) {
    return (delta : number, value : number) : string => {

        const amount    = sliderFactor[param]
        const [min,max] = AudioParamRanges[param]
        const useLinear = hasLinearSlider[param] || value === 0
        const factor    = useLinear ? delta : delta * value
        const newValue  = clamp(min, value + factor * amount, max)

        node.setValueOfParam(param, newValue)
        return newValue.toPrecision(5)
    }
}




function createDraggableNumberInput(initialValue : number, 
    mousedownFunc : () => number,
    updateFunc : (delta : number, startValue : number) => string, 
    manualUpdater : (value : number) => void ) {

    const valueInput = E('input') as HTMLInputElement
    valueInput.type = 'number'
    valueInput.classList.add('number-grab')
    valueInput.value = initialValue.toString()

    // needs to be temporarily disabled so the user doesn't interact with the canvas
    const canvasHandler = GraphCanvas.canvas.onmousemove 

    let startX : number,
        startY : number, 
        startValue : number

    const mousedown = function(e : MouseEvent) {
        startX = e.clientX
        startY = e.clientY
        startValue = mousedownFunc()
        GraphCanvas.canvas.onmousemove = null
        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)
    }

    const mousemove = function(e : MouseEvent) {
        if (e.buttons !== 1) return;
        valueInput.value = 
            updateFunc(startY-e.clientY + (e.clientX-startX)/128.0, startValue)
    }

    const mouseup = (e : MouseEvent) => {
        GraphCanvas.canvas.onmousemove = canvasHandler
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    valueInput.onmousedown = mousedown
    valueInput.oninput = () => manualUpdater(+valueInput.value)
    return valueInput
}
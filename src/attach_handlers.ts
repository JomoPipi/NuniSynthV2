






// Switch tabs
D('tab-swapper')!.oninput = function() {
    const value = (D('tab-swapper') as HTMLSelectElement).value
    ;[...document.getElementsByClassName('tab')].forEach((tab:any) => {
        tab.classList.toggle('show', value === tab.id)
    })
    resizeHandler()
}
D('node-options')!.classList.toggle('show',true)



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

// Help the user
D('about')!.onclick = () =>
    window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')








// Change buffer index
;['up','down'].forEach((s,i) => {
    D('buffer-index-'+s)!.onclick = () => {
        const idx = currentBufferIndex = clamp(0, currentBufferIndex + Math.sign(.5 - i), nBuffers-1)
        D('buffer-index')!.innerHTML = idx.toString()
        refreshAffectedBuffers()
    }
})

// Reverse buffer at current index
D('reverse-buffer')!.onclick = () => {
    BUFFERS[currentBufferIndex].getChannelData(0).reverse()
    refreshAffectedBuffers()
}

function refreshAffectedBuffers() {
    const canvas = D('buffer-canvas') as HTMLCanvasElement

    displayBuffer(BUFFERS[currentBufferIndex], canvas)

    G.nodes.forEach(node => {
        if (node.audioNode instanceof SamplerNode && node.audioNode.bufferIndex === currentBufferIndex) {
            node.audioNode.refresh()
        }
    })
}
refreshAffectedBuffers()

function displayBuffer(buff : AudioBuffer, canvas : HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!
    const H = canvas.height, W = canvas.width
    const channel = buff.getChannelData(0)
    ctx.save()
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#121'
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(0, H / 2)
    ctx.globalAlpha = 0.06
    for (let i = 0; i < channel.length; i++) {
        const x = W * i / channel.length |0
        const y = channel[i] * H / 2
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 1, y)
        ctx.stroke()
    }
    ctx.restore()
    console.log('Done rendering buffer')
}








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

// Inject (or hide) HTML that allows manipulation of the selected node
G.selectNodeFunc = () => {
    const node = G.selectedNode as NuniGraphNode
    const controls = D('injected-node-value-ui') as HTMLDivElement

    controls.innerHTML = ''
    D('right-panel')!.style.width = node ? '20vw' : '0px'
    if (!node) return;

    if (node.audioNode instanceof SamplerNode || node.audioNode instanceof OscillatorNode2) {
        controls.appendChild(showKeyboardConnection(node))
    }
    
    controls.appendChild(showSubtypes(node))

    if (node.audioNode instanceof SamplerNode) {
        controls.appendChild(samplerControls(node.audioNode))
    }

    controls.appendChild(exposeAudioParams(node))

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




function showKeyboardConnection(node : NuniGraphNode) : Node {
    const types = ['none','mono','poly']
    const select = E('select') as HTMLSelectElement
    const box = E('div'); box.innerHTML = 'keyboard: '
    
    insertOptions(select, types)
    select.value = node.audioNode.kbMode
    select.oninput = function() {
        node.audioNode.setKbMode(select.value)
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




function samplerControls(audioNode : SamplerNode) {
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
        btn.classList.toggle('selected',(audioNode as Indexible)[text])
        btn.onclick = () => {
            const on = (audioNode as Indexible)[text] ^= 1
            btn.classList.toggle('selected', <any>on)
            audioNode.refresh()
        }
        box.appendChild(btn)
    })

    return box
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




function createUpdateParamFunc(node : NuniGraphNode, param : AudioParams) {
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




function createDraggableNumberInput(initialValue : string, updateFunc: (delta : number) => string, manualUpdater : (value : number) => void ) {
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
























MY_JS_DIALS.forEach(dial => {
    // if (dial.id.startsWith('aux')) 
    // {

    //     dial.value = aux_ADSR[dial.id.split`-`[2]]
    //     dial.render()
    //     dial.attach(x => {
    //         aux_ADSR[dial.id.split`-`[2]] = x
    //         aux_ADSR.render()
    //     })

    // } 
    // else if (dial.id.includes('adsr')) 
    {
        const s = (<any>dial).id.split('-')[1]
        dial.value = (ADSR as any)[s]
        dial.render()
        dial.attach((x : number) => {
            (ADSR as any)[s] = x * x
            ADSR.render()
        })

    }
    // else if (dial.id === 'BPM') {
        
    //     D('BPM-text').innerHTML = BPM,
    //     dial.attach(x => {
    //         BPM = D('BPM-text').innerHTML = (500 ** .5) ** (x+1) | 0  
    //     })
    // }
})
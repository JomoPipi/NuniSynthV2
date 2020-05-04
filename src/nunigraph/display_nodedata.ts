






// Inject (or hide) HTML that allows manipulation of the selected node
function set_selectNodeFunc(g : NuniGraph, container : HTMLDivElement, prompt : HTMLDivElement) {
    g.selectNodeFunc = () => {
        const node = g.selectedNode as NuniGraphNode

        container.classList.toggle('show', node != undefined)
        if (!node) return;

        container.innerHTML = ''
        const controls = E('div')
        container.appendChild(
            createDraggableTopBar(
            `&nbsp; ${node.type.toUpperCase()}, &nbsp; id: ${node.id}`))
        container.appendChild(controls)

        controls.appendChild(showSubtypes(node))

        if (node.audioNode instanceof BufferNode2) {
            controls.appendChild(samplerControls(node.audioNode))
        }

        if (node.audioNode instanceof NuniSourceNode) {
            // controls.appendChild(showKeyboardConnection(node.audioNode))
            controls.appendChild(activateKeyboardButton(node.audioNode))
        }

        controls.appendChild(exposeAudioParams(node))

        // Add delete button
        if (node.id === 0) return; // Don't delete the master gain node
        const deleteNode = E('button')
        deleteNode.innerHTML = 'delete this node'
        deleteNode.style.float = 'right'
        deleteNode.onclick = _ => {  

            /** If this prompt stays open then connections 
             *  to deleted nodes become possible, and the 
             *  program blows up if you try to do that. 
             * */ 
            prompt.style.display = 'none'

            UndoRedoModule.save()
            g.deleteNode(node)
            g.unselectNode()
            GraphCanvas.render() // Has to be generalized, as well.
        }
        controls.append(deleteNode)
    }
}

function activateKeyboardButton(an : NuniSourceNode) {
    // (dis?)connects the node from the keyboard.
    const btn = E('button')
    btn.innerHTML = '🎹'
    btn.classList.add('kb-button')
    btn.classList.toggle('selected', an.kbMode !== 'none')
    btn.onclick = () => {
        const enable = an.kbMode === 'none'
        an.setKbMode(enable ? KB.mode : 'none')
        btn.classList.toggle('selected', enable)
    }
    return btn
}

function showSubtypes(node : NuniGraphNode) : Node {
    const subtypes = AudioNodeSubTypes[node.type] as string[]
    const box = E('span')
    if (subtypes.length > 0) { // Show subtypes selector
        const select = E('select') as HTMLSelectElement
        
        insertOptions(select, subtypes)
        select.value = node.audioNode.type
        select.oninput = function() {
            UndoRedoModule.save()
            node.audioNodeType = 
            node.audioNode.type = select.value
        } 
        box.appendChild(select)
    }
    return box
}




function insertOptions(select : HTMLSelectElement, options : string[]) {
    select.innerHTML = 
        options.map(type => `<option>${type}</option>`).join('')
}




function samplerControls(audioNode : BufferNode2) {
    const box = E('span')
    box.innerHTML = '<span> buffer </span>'
    box.classList.add('buffer-row')
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

    return box
}




function exposeAudioParams(node : NuniGraphNode) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        box.classList.add('box')

        box.innerHTML = `<span>${param}</span>`

        const initialValue = node.audioParamValues[param]

        const updateFunc = 
            createUpdateParamFunc(node,param)

        const mousedownFunc = () => {
            UndoRedoModule.save()
            return node.audioParamValues[param]
        }
        const manualUpdater = (x:number) => {
            UndoRedoModule.save()
            node.setValueOfParam(param, x)
        }
        
        box.appendChild(
            createDraggableNumberInput(
                initialValue, 
                mousedownFunc, 
                updateFunc, 
                manualUpdater))

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
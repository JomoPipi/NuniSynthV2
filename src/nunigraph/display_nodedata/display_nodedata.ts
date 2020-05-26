






import { NuniSourceNode } from '../../webaudio2/nuni_source_node.js'
import { GraphUndoRedoModule } from '../graph_undo_redo.js'
import { NuniGraphNode } from '../nunigraph_node.js'
import { BufferNode2 } from '../../webaudio2/buffer2.js'
import { KB } from '../../webaudio2/keyboard.js'
import { BufferController } from '../../buffer_utils/init_buffers.js'
import { SubgraphSequencer } from '../../webaudio2/sequencers/subgraph-sequencer.js'
import { sequencerControls } from './sequencer-controls.js'
import { GraphController, G } from '../init.js'







export function createValuesWindow(node : NuniGraphNode, deleteCallback : Function) {
    const controls = E('div')

    controls.appendChild(showSubtypes(node))

    if (node.audioNode instanceof SubgraphSequencer) {
        controls.appendChild(sequencerControls(node))
    }

    if (node.audioNode instanceof BufferNode2) {
        controls.appendChild(samplerControls(node.audioNode))
    }

    if (node.audioNode instanceof NuniSourceNode) {
        controls.appendChild(activateKeyboardButton(node.audioNode))
    }

    controls.appendChild(exposeAudioParams(node))

    // Add delete button, but not if id is 0, because that's the master gain.
    if (node.id !== 0) {
        const deleteNode = E('button')
        deleteNode.innerText = '🗑️'
        applyStyle(deleteNode, {
            float: 'right',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.25em'
        })
        deleteNode.onclick = () => deleteCallback()
        controls.append(deleteNode)
    }
    
    return controls
}




export function activateKeyboardButton(an : NuniSourceNode) {
    // (dis?)connects the node from the keyboard.
    const btn = E('button')
    btn.innerText = '🎹'
    btn.classList.add('kb-button')
    btn.classList.toggle('selected', an.kbMode !== 'none')
    btn.onclick = () => {
        const enable = an.kbMode === 'none'
        an.setKbMode(enable ? KB.mode : 'none')
        btn.classList.toggle('selected', enable)
    }
    return btn
}




export function showSubtypes(node : NuniGraphNode) : Node {
    const subtypes = AudioNodeSubTypes[node.type] as string[]
    const box = E('span')
    if (subtypes.length > 0) { // Show subtypes selector
        const select = E('select') as HTMLSelectElement
        
        insertOptions(select, subtypes)
        select.value = node.audioNode.type
        select.oninput = function() {
            GraphUndoRedoModule.save()
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




export function samplerControls(audioNode : BufferNode2) {
    const box = E('span')
    box.innerHTML = '<span> buffer </span>'
    box.classList.add('buffer-row')
    const value = E('span'); value.innerText = String.fromCharCode(65 + audioNode.bufferIndex)
    box.appendChild(value)

    ;['-','+'].forEach((op,i) => { // change the buffer index
        const btn = E('button'); btn.innerText = op
        btn.onclick = () => {
            const v = clamp(0, 
                audioNode.bufferIndex + Math.sign(i - .5), 
                BufferController.nBuffers-1)

            value.innerText = String.fromCharCode(65 + v)
            audioNode.bufferIndex = v
            audioNode.refresh()
        }
        box.appendChild(btn)
    })
 
    ;['loop'].forEach(text => { // toggleable buttons
        const btn = E('button'); btn.innerText = text
        btn.classList.toggle('selected', (audioNode as Indexed)[text])
        btn.onclick = () => {
            const on = (audioNode as Indexed)[text] ^= 1
            btn.classList.toggle('selected', <any>on)
            audioNode.refresh()
        }
        box.appendChild(btn)
    })

    return box
}




export function exposeAudioParams(node : NuniGraphNode) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type as NodeTypes]) {
        const box = E('div')
        box.classList.add('box')

        box.innerHTML = `<span>${param}</span>`

        const initialValue = node.audioParamValues[param]

        const updateFunc = 
            createUpdateParamFunc(node,param)

        const mousedownFunc = () => {
            GraphUndoRedoModule.save()
            return node.audioParamValues[param]
        }
        const manualUpdater = (x:number) => {
            GraphUndoRedoModule.save()
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
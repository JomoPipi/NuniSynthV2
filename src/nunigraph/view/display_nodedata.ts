






import { NuniSourceNode } from '../../webaudio2/note_in/nuni_source_node.js'
// import { GraphController } from '../init.js'
import { NuniGraphNode } from '../model/nunigraph_node.js'
import { BufferNode2 } from '../../webaudio2/note_in/buffer2.js'
import { sequencerControls } from './sequencer_controls.js'
import { BufferUtils } from '../../buffer_utils/internal.js'
import Sequencer from '../../webaudio2/sequencers/sequencer.js'








export default function createValuesWindow(
    node : NuniGraphNode, 
    saveCallback : Function,
    deleteCallback : Function) {

    const controls = E('div')

    controls.appendChild(showSubtypes(node, saveCallback))

    if (node.audioNode instanceof Sequencer) {
        controls.appendChild(sequencerControls(node.audioNode))
    }

    if (node.audioNode instanceof BufferNode2) {
        controls.appendChild(samplerControls(node.audioNode))
    }

    if (node.audioNode instanceof NuniSourceNode) {
        controls.appendChild(activateKeyboardButton(node.audioNode))
    }

    if (node.id === 0) {
        controls.appendChild(masterGainControls(node))
    }
    else if (node.type !== NodeTypes.B_SEQ) {
        controls.appendChild(exposeAudioParams(node, saveCallback))
    }

    // Add delete button, but not if id is 0, because that's the master gain.
    if (node.id !== 0) {
        const deleteNodeBtn = E('button')
        deleteNodeBtn.innerText = '🗑️'
        applyStyle(deleteNodeBtn, {
            float: 'right',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.25em'
        })
        deleteNodeBtn.onclick = () => deleteCallback()
        controls.append(deleteNodeBtn)
    }
    
    return controls
}


function masterGainControls(node : NuniGraphNode) {
    const box = E('div')
    const value = node.audioNode.gain.value
    
    const dial = new JsDial()
    dial.min = 0.1
    dial.max = Math.SQRT2
    dial.value = value**(1/4.0)
    dial.sensitivity = 2**-9
    dial.render()

    const valueText = E('span')
        valueText.innerText = 
            volumeTodB(value).toFixed(1) + 'dB'

        applyStyle(valueText, {
            display: 'inline-block',
            width: '70px'
            })
    
    dial.attach((value : number) => {
        const v = value ** 4.0
        node.audioNode.gain.value = v
        valueText.innerText = 
            volumeTodB(v).toFixed(1) + 'dB'
    })

    box.append(dial.html, valueText)
    return box
}




function activateKeyboardButton(an : NuniSourceNode) {
    // (dis?)connects the node from the keyboard.
    const btn = E('button')
    btn.innerText = '🎹'
    btn.classList.add('kb-button')
    btn.classList.toggle('selected', an.kbMode === true)
    btn.onclick = () => {
        const enable = an.kbMode === false
        an.kbMode = enable
        btn.classList.toggle('selected', enable)
    }
    return btn
}




function showSubtypes(node : NuniGraphNode, saveCallback: Function) : Node {
    const subtypes = AudioNodeSubTypes[node.type] as string[]
    const box = E('span')
    const an = node.audioNode as { type : any }
    if (subtypes.length > 0) { // Show subtypes selector
        const select = E('select')
        
        insertOptions(select, subtypes)
        select.value = an.type
        select.oninput = function() {
            saveCallback()
            an.type = select.value
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
    const value = E('span'); value.innerText = String.fromCharCode(65 + audioNode.bufferKey)
    box.appendChild(value)

    // TODO: change this to a select box, 
    // and don't depend on BufferUtils, 
    // depend on BufferStorage, instead.
    ;['-','+'].forEach((op,i) => { // change the buffer index
        const btn = E('button'); btn.innerText = op
        btn.onclick = () => {
            const v = clamp(0, 
                audioNode.bufferKey + Math.sign(i - .5), 
                BufferUtils.nBuffers-1)

            value.innerText = String.fromCharCode(65 + v)
            audioNode.bufferKey = v
            audioNode.refresh()
        }
        box.appendChild(btn)
    })
 
    ;['loop'].forEach(text => { // toggleable buttons
        const btn = E('button'); btn.innerText = text
        const an = audioNode as Indexed
        btn.classList.toggle('selected', an[text])
        btn.onclick = () => {
            const on = (an[text] ^= 1) ? true : false
            btn.classList.toggle('selected', on)
            audioNode.refresh()
        }
        box.appendChild(btn)
    })

    return box
}




function exposeAudioParams(node : NuniGraphNode, saveCallback : Function) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type]) {
        const box = E('div')
        box.classList.add('box')

        box.innerHTML = `<span>${param}</span>`

        const initialValue = node.audioParamValues[param]

        const updateFunc = 
            createUpdateParamFunc(node,param)

        const mousedownFunc = () => {
            saveCallback()
            return node.audioParamValues[param]
        }
        const manualUpdater = (x:number) => {
            saveCallback()
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
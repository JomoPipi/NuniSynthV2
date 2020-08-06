






import { NuniGraphNode } from '../model/nunigraph_node.js'
import { sequencerControls } from './sequencer_controls.js'
import { BufferUtils } from '../../buffer_utils/internal.js'
import { audioCaptureNodeControls } from './audio_capture_controls.js'
import { createResizeableGraphEditor } from './resizeable_graph_editor.js'
import 
    { NuniSourceNode, BufferNode2, Sequencer
    , AudioBufferCaptureNode, NuniGraphAudioNode, MasterClock 
    } from '../../webaudio2/internal.js'
import 
    { createDraggableNumberInput
    , createToggleButton
    , applyStyle, JsDial
    } from '../../UI_library/internal.js'
import { createSubdivSelect } from './dialogbox_components.js'






export function createValuesWindow(
    node : NuniGraphNode, 
    saveCallback : Function,
    deleteCallback : Function) {

    const controls = E('div')

    controls.appendChild(showSubtypes(node, saveCallback))

    if (NodeTypeWarnings[node.type]) 
    {
        controls.appendChild(warningButton(node.type))
    }

    if (node.audioNode instanceof NuniGraphAudioNode) 
    {
        controls.style.margin = '0 0'
        controls.appendChild(createResizeableGraphEditor(node.audioNode))
    }

    if (node.audioNode instanceof AudioBufferCaptureNode) 
    {
        controls.appendChild(audioCaptureNodeControls(node.audioNode))
    }

    if (node.audioNode instanceof Sequencer) 
    {
        controls.appendChild(sequencerControls(node.audioNode))
    }

    if (node.audioNode instanceof BufferNode2) 
    {
        controls.appendChild(samplerControls(node.audioNode))
    }

    if (node.audioNode instanceof NuniSourceNode) 
    {
        controls.appendChild(activateKeyboardButton(node.audioNode))
    }

    if (node.id === 0) 
    {
        controls.appendChild(gainControls(node))
    }
    else if (node.type !== NodeTypes.B_SEQ) 
    {
        controls.appendChild(exposeAudioParams(node, saveCallback))
    }

    // // Add delete button, but not if id is 0, because that's the master gain.
    // if (node.id !== 0) 
    // {
    //     const deleteNodeBtn = E('button', { text: '🗑️' })
    //     applyStyle(deleteNodeBtn, 
    //         { textAlign: 'center'
    //         , backgroundColor: 'transparent'
    //         , border: 'none'
    //         , fontSize: '1.25em'
    //         })
    //     deleteNodeBtn.onclick = () => deleteCallback()
    //     controls.append(deleteNodeBtn)
    // }
    
    return controls
}

function warningButton(type : NodeTypes) {
    return E('span', 
        { text: '!'
        , className: 'tooltip'
        
        , children: [E('span',
            { text: NodeTypeWarnings[type]
            , className: 'tooltiptext'
            })]
        
        , props: { style: 
            { width: '20px'
            , height: '20px'
            , float: 'right'
            , backgroundColor:' orange'
            }}
        })
}


function gainControls(node : NuniGraphNode) {
    const value = node.audioNode.gain.value
    
    const dial = new JsDial(1)
    dial.min = 0.1
    dial.max = Math.SQRT2
    dial.value = value**(1/4.0)
    dial.sensitivity = 2**-9
    dial.render()

    const valueText = E('span', 
        { text: `${volumeTodB(value).toFixed(1)}dB` })

        applyStyle(valueText, 
            { display: 'inline-block'
            , width: '70px'
            })
    
    dial.attach((v : number) => {
        const value = v ** 4.0
        node.setValueOfParam('gain', value)
        valueText.innerText =
            `${volumeTodB(value).toFixed(1)}dB`
    })

    const box = E('div', { children: [dial.html, valueText] })
    return box
}




function activateKeyboardButton(an : NuniSourceNode) {

    return createToggleButton(
        an,
        'kbMode',
        { text: '🎹'
        , className: 'kb-button' 
        })
}




function showSubtypes(node : NuniGraphNode, saveCallback: Function) : Node {
    const subtypes = AudioNodeSubTypes[node.type]
    const box = E('span')
    const an = node.audioNode as { type : any }

    if (subtypes.length > 0) // Show subtypes selector
    { 
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
    const box = E('span', 
        { className: 'buffer-row'
        , children: [E('span', { text: 'buffer' })]
        })
        
    const value = E('span', { text: String.fromCharCode(65 + audioNode.bufferKey) })
    box.appendChild(value)

    // TODO: change this to a select box, 
    // and don't depend on BufferUtils, 
    // depend on BufferStorage, instead.
    ;['-','+'].forEach((op,i) => { // change the buffer index
        const btn = E('button', { text: op })
        btn.onclick = () => {
            const v = clamp(0, 
                audioNode.bufferKey + Math.sign(i - .5), 
                BufferUtils.nBuffers-1)

            value.innerText = String.fromCharCode(65 + v)
            audioNode.bufferKey = v
        }
        box.appendChild(btn)
    })
 
    box.appendChild(createToggleButton(
        audioNode, 
        'loop', 
        { update: (on : boolean) => audioNode.refresh()}
        ))

    return box
}




function exposeAudioParams(node : NuniGraphNode, saveCallback : Function) : Node {
    const allParams = E('div')
    for (const param of AudioNodeParams[node.type]) 
    {
        const initialValue = node.audioParamValues[param]
        const isGain = param === 'gain' // TODO: get rid of hardcoding
        const to_dB = (n : number) => 
            `gain (${volumeTodB(Math.abs(n)).toFixed(2)} dB)`

        const text = E('span', 
            { text: isGain 
            ? to_dB(initialValue)
            : param 
            })

        const textBox = E('span', { children: [text] })

        const box = E('div', 
            { className: 'params-box'
            , children: [textBox]
            })

        const updateFunc = isGain
            ? (newValue : number) => {
                text.textContent = to_dB(newValue)
                node.setValueOfParam(param, newValue)
            }
            : (newValue : number) =>
                node.setValueOfParam(param, newValue)

        const mousedownFunc = () => {
            return node.audioParamValues[param]
        }
        
        const settings = 
            { amount: sliderFactor[param]
            , min: AudioParamRanges[param][0]
            , max: AudioParamRanges[param][1]
            , isLinear: hasLinearSlider[param]
            }

        const numberInput = 
            createDraggableNumberInput(
                initialValue, 
                mousedownFunc, 
                updateFunc,
                settings)

        box.appendChild(numberInput)

        allParams.appendChild(box)

        
        if (isSubdividable[param]) {
            const subdiv = { subdiv: 0 }
            const subdivSelect = createSubdivSelect(subdiv, updateParam)

            textBox.appendChild(subdivSelect)

            function updateParam(value : number) {
                const newValue = param === 'frequency'
                    ? value / (60 * 4 / MasterClock.getTempo()) // Frequency
                    : (60 * 4 / MasterClock.getTempo() / value) // Time Interval
                numberInput.value = newValue.toString()
                updateFunc(newValue)
            }
        }
    }
    return allParams
}
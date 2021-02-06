






import { NuniGraphNode } from '../model/nunigraph_node.js'
import 
    { NuniSourceNode, NuniSampleNode, Sequencer
    , NuniRecordingNode, NuniGraphAudioNode
    , MasterClock, AutomationNode 
    } from '../../webaudio2/internal.js'
import 
    { createNumberDialComponent3, createResizeableCanvas, createToggleButton
    , JsDial
    } from '../../UI_library/internal.js'
import { createSubdivSelect } from './create_subdivselect.js'
import { GraphController } from '../init.js'
import { doUntilMouseUp } from '../../UI_library/events/until_mouseup.js'
import { ProcessorNode } from '../../webaudio2/nodes/processor/processor.js'
import { OpenGraphControllers } from '../controller/graph_controller.js'
// import { NuniNumberNode } from '../../webaudio2/nodes/number/number.js'
import { createADSREditor } from '../../webaudio2/adsr/adsr_editor.js'
import { createSliderComponent } from '../../UI_library/components/sliderComponent.js'
import { MonoPianoRoll } from '../../webaudio2/nodes/pianoroll/mono_pianoroll.js'


const hasSubtypes = (node : NuniGraphNode) : node is NuniGraphNode<HasSubtypes> =>
    node.type in HasSubtypes

const exposesAudioParams = (node : NuniGraphNode) 
: node is NuniGraphNode<keyof typeof ExposesAudioparamsInDialogBox> =>
    node.type in ExposesAudioparamsInDialogBox

export function createValuesWindow(
    node : NuniGraphNode, 
    saveCallback : Function,
    deleteCallback : Function,
    ancestor : HTMLElement) {

    const { audioNode } = node
    const controls = E('div')
    
    if (hasSubtypes(node))
    {
        controls.appendChild(showSubtypes(node, saveCallback))
    }

    if (NodeTypeWarnings[node.type]) 
    {
        controls.appendChild(warningButton(node.type))
    }

    if (audioNode instanceof AutomationNode)
    {
        controls.appendChild(audioNode.getController())
    }

    if (audioNode instanceof NuniGraphAudioNode) 
    {

        const initFunc = () =>
            requestAnimationFrame(() => {
                audioNode.controller.renderer.updateNodeRadius()
                audioNode.controller.renderer.render()
            })
        
        const mousemoveFunc = () => {
            audioNode.controller.renderer.updateNodeRadius()
            audioNode.controller.renderer.render()
        }
        
        const box = createResizeableCanvas({ canvas: audioNode.canvas, initFunc, mousemoveFunc, keepRatio: true }, ancestor)
        controls.appendChild(box)

        // controls.appendChild(createResizeableGraphEditor(audioNode))
    }

    if (audioNode instanceof NuniRecordingNode) 
    {
        controls.appendChild(audioNode.getController())
    }

    if (audioNode instanceof Sequencer) 
    {
        controls.appendChild(audioNode.getController())
    }

    if (audioNode instanceof NuniSampleNode) 
    {
        controls.appendChild(audioNode.getController())
    }

    // if (audioNode instanceof NuniNumberNode)
    // {
    //     controls.appendChild(audioNode.getController())
    // }

    if (node.type === NodeTypes.OUTPUT)
    {
        controls.appendChild(gainControls(
            node as NuniGraphNode<NodeTypes.OUTPUT>))
    }
    else if (exposesAudioParams(node)) 
    {
        controls.appendChild(exposeAudioParams(node, saveCallback))
    }
    
    if (audioNode instanceof NuniSourceNode) 
    {
        controls.appendChild(activateKeyboardButton(audioNode))
    }
//////////////////////////////////////////////////////////
    // if (audioNode instanceof PianoRoll12Tone)
    // {
    //     controls.appendChild(audioNode.pianoRoll)
    // }
    if (audioNode instanceof MonoPianoRoll)
    {
        controls.appendChild(audioNode.getController())
    }
//////////////////////////////////////////////////////////
    else if (audioNode instanceof ProcessorNode)
    {
        controls.appendChild(audioNode.getController())
    }
    
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
        })
}


function gainControls(node : NuniGraphNode<NodeTypes.OUTPUT>) {
    const value = node.audioNode.gain.value
    const dial = new JsDial(1)
    dial.min = 0.1
    dial.max = Math.SQRT2
    dial.value = value**(1/4.0)
    dial.sensitivity = 2**-9
    dial.render()

    const valueText = E('span', 
        { text: `${volumeTodB(value).toFixed(1)}dB` })
    
    dial.attach((v : number) => {
        const value = v ** 4.0
        node.setValueOfParam('gain', value)
        valueText.innerText =
            `${volumeTodB(value).toFixed(1)}dB`
    })
    if (node !== GraphController.g.masterGain)
    { // If it's not the master output we don't allow this
        dial.html.ondblclick = dial.update.bind(null, 1)
    }

    const box = E('div', { children: [dial.html, valueText] })
    return box
}




function activateKeyboardButton(an : NuniSourceNode) {
    
    const adsr = createADSREditor(an.localADSR)
        adsr.classList.toggle('hide', !an.kbMode)
        
    const toggle = createToggleButton(
        an,
        'kbMode',
        { text: '🎹'
        , className: 'kb-button neumorph2'
        , 
            update(on : boolean) {
                adsr.classList.toggle('hide', !on)
            }
        })

    return E('div', 
        { className: 'flex-center some-padding'
        , children: [toggle, adsr]
        })
}




function showSubtypes(node : NuniGraphNode<HasSubtypes>, saveCallback: Function) : HTMLElement {

    const box = E('span', { className: 'flex-center' })

    if (node.audioNode.type in GraphIconImageObjects)
    {
        const types = AudioNodeSubTypes[node.type]

        const typeImages = types.map(name => {
            
            const img = E('img', { className: 'dim' })
            img.src = `svg_images/${name}.svg`
            img.dataset.name = name
            return img
        })

        ;(box.onclick = setType)
        ({ target: typeImages[types.indexOf(node.audioNode.type)] })
        box.append(...typeImages)

        return box;
        
        function setType(e : any) {
            const selectionClass = 'opaque' // 'selected'
            if (!typeImages.includes(e.target)) return;
            for (const img of typeImages) 
            {
                const selected = img === e.target
                img.classList.toggle(selectionClass, selected)
                if (selected) 
                {
                    node.audioNode.type = e.target.dataset.name
                }
            }
            for (const controller of OpenGraphControllers.list)
            {
                if (controller.g.nodes.includes(node))
                {
                    // Update the outward appearance of the node
                    controller.renderer.render()
                    break
                }
            }
        }
    }

    const subtypes = AudioNodeSubTypes[node.type]
    const an = node.audioNode

    if (subtypes.length > 0) // Show subtypes selector
    { 
        const select = E('select')
        
        insertOptions(select, subtypes)
        select.value = an.type
        select.oninput = function() {
            saveCallback()
            an.type = select.value as any//typeof AudioNodeSubTypes[typeof node.type]
        } 
        box.appendChild(select)
    }
    return box
}




function insertOptions(select : HTMLSelectElement, options : readonly string[]) {
    select.innerHTML = 
        options.map(type => `<option>${type}</option>`).join('')
}




function exposeAudioParams(node : NuniGraphNode<CanBeAutomated>, saveCallback : Function) : Node {
    const params = AudioNodeParams[node.type]
    const hasVolumeLevel = node.audioNode instanceof NuniSourceNode
    const className = hasVolumeLevel
        ? 'audioparams-container-with-slider'
        : params.length > 1 
        ? 'audioparams-container' 
        : 'audioparam-container'
    const allParams = E('div', { className })
    for (const param of params) 
    {
        const initialValue = node.audioParamValues[param]
        const isGain = param === 'gain'
        const to_dB = (n : number) => // ''
            `gain (${volumeTodB(Math.abs(n)).toFixed(2)} dB)`

        const text = E('span', 
            { text: isGain 
                ? to_dB(initialValue)
                : param 
            })

        const textBox = E('div', { children: [text] })

        const box = E('div', { className: 'center' })

        const updateFunc = isGain
            ? (newValue : number) => {
                text.textContent = to_dB(newValue)
                node.setValueOfParam(param, newValue)
            }
            : (newValue : number) =>
                node.setValueOfParam(param, newValue)

        const settings = 
            { amount: AudioParamSliderFactor[param]
            , min: AudioParamRanges[param][0]
            , max: AudioParamRanges[param][1]
            , isLinear: hasLinearSlider[param]
            , rounds: AudioParamKnobTurns[param]
            }

        const numberInput = createNumberDialComponent3(initialValue, updateFunc, settings)

        box.append(numberInput.container, textBox)

        allParams.appendChild(box)

        
        if (isSubdividable[param]) {
            const subdiv = { subdiv: 0 }
            const subdivSelect = createSubdivSelect(subdiv, { fn: updateParam })
                subdivSelect.style.display = 'block'

            textBox.append(subdivSelect)

            function updateParam(value : number) {
                const newValue = param === 'frequency'
                    ? value / (60 * 4 / MasterClock.getTempo()) // Frequency
                    : (60 * 4 / MasterClock.getTempo() / value) // Time Interval
                    // numberInput.value = newValue.toString()
                    numberInput.setValue(newValue)
                updateFunc(newValue)
            }
        }
    }
    if (hasVolumeLevel) 
    {
        allParams.appendChild(createSliderComponent(node.audioNode as NuniSourceNode))
    }
    return allParams
}







import { NuniGraphNode } from '../model/nunigraph_node.js'
import { sequencerControls } from '../../webaudio2/sequencers/sequencer_controls.js'
import { BufferUtils  } from '../../buffer_utils/internal.js'
import { audioCaptureNodeControls } from './audio_capture_controls.js'
// import { createResizeableGraphEditor } from './resizeable_graph_editor.js'
import 
    { NuniSourceNode, NuniSampleNode, Sequencer
    , NuniRecordingNode, NuniGraphAudioNode
    , MasterClock, PianoRoll12Tone, OscillatorNode2, AutomationNode 
    } from '../../webaudio2/internal.js'
import 
    { createNumberDialComponent3, createResizeableCanvas, createToggleButton, createResizeableWindow
    , JsDial
    } from '../../UI_library/internal.js'
import { createSubdivSelect } from './create_subdivselect.js'
import { GraphController } from '../init.js'
import { doUntilMouseUp } from '../../UI_library/events/until_mouseup.js'
import { ProcessorNode } from '../../webaudio2/nodes/processor/processor_node.js'
import { ActiveControllers } from '../controller/graph_controller.js'


const hasSubtypes = (node : NuniGraphNode) : node is NuniGraphNode<HasSubtypes> =>
    node.type in HasSubtypes

const exposesAudioParams = (node : NuniGraphNode) : node is NuniGraphNode<keyof typeof ExposesAudioparamsInDialogBox> =>
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
        controls.appendChild(audioCaptureNodeControls(audioNode))
    }

    if (audioNode instanceof Sequencer) 
    {
        controls.appendChild(sequencerControls(audioNode))
    }

    if (audioNode instanceof NuniSampleNode) 
    {
        controls.appendChild(samplerControls(audioNode))
    }

    if (audioNode instanceof OscillatorNode2) 
    {
        controls.appendChild(activateKeyboardButton(audioNode))
    }

    if (node.id === 0) // || node.type === NodeTypes.GAIN) 
    {
        controls.appendChild(gainControls(
            node as NuniGraphNode<NodeTypes.GAIN>))
    }
    else if (exposesAudioParams(node)) 
    {
        controls.appendChild(exposeAudioParams(node, saveCallback))
    }
    
    if (audioNode instanceof PianoRoll12Tone)
    {
        controls.appendChild(createResizeableCanvasWindow(
            audioNode.pianoRoll))
        //* webaudio-pianoroll has to be loaded
        //* for play() to be defined
        // requestAnimationFrame(_ => audioNode.play())
    }
    else if (audioNode instanceof ProcessorNode)
    {
        controls.appendChild(createResizeableWindow(
            audioNode.getUIComponent(), ancestor, audioNode.resizeUI.bind(audioNode)))
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

    
function createResizeableCanvasWindow(content : HTMLCanvasElement) {
    const box = E('div')
    const canvas = content

    const topRow = E('div', { className: 'full' }); topRow.style.height = '5px'
    const leftEdge = E('div', { className: 'ew-edge-drag' })
    const rightEdge = E('div', { className: 'ew-edge-drag' })
    const middleRowContainer = E('div', { className: 'draggable-row' })
    const bottomRow = E('div', { className: 'resizeable-window-bottom-row' })
    const dragCorner = E('div', { className: 'nwse-corner-drag-box' })
    const dragCornernesw = E('div', { className: 'nesw-corner-drag-box' })
    const bottomMiddleEdge = E('span')
        
    bottomRow.append(dragCornernesw, bottomMiddleEdge, dragCorner)

    const NONE = 0, VERTICAL = 1, HORIZONTAL = 2
    let xy : number[] = [0,0], wh : number[]
    let resizeDirection = 0
    let doLeft = false
    let canvasMinWidth = Infinity
    
    box.onmousedown = doUntilMouseUp(mousemove, { mousedown })

    function mousedown(e : MouseEvent) {
        doLeft = [leftEdge, dragCornernesw].includes(e.target as HTMLDivElement)

        resizeDirection =
        e.target === dragCorner || 
        e.target === dragCornernesw
            ? 3
            : e.target === rightEdge || e.target === leftEdge
            ? HORIZONTAL
            : e.target === bottomMiddleEdge 
            ? VERTICAL
            : NONE

        if (resizeDirection === NONE) return;

        xy = [e.clientX, e.clientY]
        wh = [canvas.offsetWidth, canvas.offsetHeight]

        // Set the canvas' min width
        const w = canvas.width
        canvas.width = 0
        canvasMinWidth = canvas.offsetWidth
        canvas.width = w
    }

    function mousemove(e : MouseEvent) {
        
        const [X,Y] = [e.clientX, e.clientY]
        const [x,y] = xy
        const [w,h] = wh
        
        if (resizeDirection & HORIZONTAL) 
        {
            if (doLeft)
            {
                // To prevent moving the container, 
                // we must not go lower than the min width
                // X <= w + x - minWidth
                const _X = Math.min(X, w + x - canvasMinWidth)

                // TODO: comment this back in is theres canvas bugs
                // canvas.parentElement!.parentElement!
                //     .parentElement!.parentElement!.parentElement!
                //     .style.left = _X + 'px'

                canvas.width = Math.max(0, w + x - _X)
            }
            else
            {
                canvas.width = Math.max(0, w + X - x)
            }
        }
        if (resizeDirection & VERTICAL) 
        {
            canvas.height = Math.max(0, h + Y - y)
        }

    }

    middleRowContainer.append(leftEdge, canvas, rightEdge)
    box.append(topRow, middleRowContainer, bottomRow)

    return box
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


function gainControls(node : NuniGraphNode<NodeTypes.GAIN>) {
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
    
    return createToggleButton(
        an,
        'kbMode',
        { text: '🎹'
        , className: 'kb-button' 
        })
}




function showSubtypes(node : NuniGraphNode<HasSubtypes>, saveCallback: Function) : HTMLElement {

    const box = E('span')

    // if (HasCustomSubtype[node.type]) //
    // if (node.type === NodeTypes.OSC)
    if (node.audioNode.type in GraphIconImageObjects)
    {
        const types = AudioNodeSubTypes[node.type]

        const typeImages = types.map(name => {
            
            const img = E('img', { className: 'dim' })
            img.src = `images/${name}.svg`
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
            for (const controller of ActiveControllers)
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




function samplerControls(audioNode : NuniSampleNode) {
    const box = E('span', { className: 'buffer-stuff-row' })

    box.appendChild(E('span', { text: 'buffer' }))

    const text = String.fromCharCode(65 + audioNode.bufferKey)
    const value = E('span', { text })
    box.appendChild(value)


    // TODO: change this to a select box, 
    // and don't depend on BufferUtils, 
    // depend on BufferStorage, instead.
    ;['-','+'].forEach((op,i) => { // change the buffer index
        const btn = E('button', { text: op })
        btn.onclick = () => {
            const key = clamp(0,
                audioNode.bufferKey + Math.sign(i - .5), 
                BufferUtils.nBuffers-1)

            value.innerText = String.fromCharCode(65 + key)
            audioNode.bufferKey = key
        }
        box.appendChild(btn)
    })
 
    box.appendChild(createToggleButton(
        audioNode, 
        'loop', 
        { update: (on : boolean) => audioNode.refresh() }
        ))
        
    box.appendChild(activateKeyboardButton(audioNode))

    const container = E('div', 
        { className: 'some-border vert-split'
        , children: [box, audioNode.bufferCanvas.frame] 
        })
    return container
}




function exposeAudioParams(node : NuniGraphNode<CanBeAutomated>, saveCallback : Function) : Node {
    const params = AudioNodeParams[node.type]
    const className = params.length > 1 ? 'audioparams-container' : 'audioparam-container'
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

        // const box = E('div', { className: 'flat-grid some-margin' })
        const box = E('div')//, { className: 'params-box-2' })
            // box.style.backgroundColor = 'red'

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
            }

        const rounds = AudioParamKnobTurns[param]
        const numberInput = 
            // createDraggableNumberInput( // Not so user friendly
            // createNumberDialComponent2( // The solution
            //     initialValue, 
            //     mousedownFunc, 
            //     updateFunc,
            //     settings)
            createNumberDialComponent3(initialValue, updateFunc, settings, rounds)

        // numberInput.container.classList.add('full','flex-center')
        // box.append(textBox, numberInput)
        box.append(numberInput.container, textBox)

        allParams.appendChild(box)

        
        if (isSubdividable[param]) {
            const subdiv = { subdiv: 0 }
            const subdivSelect = createSubdivSelect(subdiv, { fn: updateParam })

            textBox.append(' ', subdivSelect)

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
    return allParams
}
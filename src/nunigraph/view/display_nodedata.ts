






import { NuniGraphNode } from '../model/nunigraph_node.js'
import { sequencerControls } from './sequencer_controls.js'
import { BufferUtils  } from '../../buffer_utils/internal.js'
import { audioCaptureNodeControls } from './audio_capture_controls.js'
import { createResizeableGraphEditor } from './resizeable_graph_editor.js'
import 
    { NuniSourceNode, BufferNode2, Sequencer
    , AudioBufferCaptureNode, NuniGraphAudioNode
    , MasterClock, PianoRoll12Tone, OscillatorNode2 
    } from '../../webaudio2/internal.js'
import 
    { createDraggableNumberInput
    , createToggleButton
    , JsDial
    } from '../../UI_library/internal.js'
import { createSubdivSelect } from './dialogbox_components.js'
import { GraphController } from '../init.js'
import { doUntilMouseUp } from '../../UI_library/events/until_mouseup.js'
import { ProcessorNode } from '../../webaudio2/processor/processornode.js'






export function createValuesWindow(
    node : NuniGraphNode, 
    saveCallback : Function,
    deleteCallback : Function) {

    const { audioNode } = node
    const controls = E('div')
    
    controls.appendChild(showSubtypes(node, saveCallback))

    if (NodeTypeWarnings[node.type]) 
    {
        controls.appendChild(warningButton(node.type))
    }

    if (audioNode instanceof NuniGraphAudioNode) 
    {
        controls.appendChild(createResizeableGraphEditor(audioNode))
    }

    if (audioNode instanceof AudioBufferCaptureNode) 
    {
        controls.appendChild(audioCaptureNodeControls(audioNode))
    }

    if (audioNode instanceof Sequencer) 
    {
        controls.appendChild(sequencerControls(audioNode))
    }

    if (audioNode instanceof BufferNode2) 
    {
        controls.appendChild(samplerControls(audioNode))
    }

    if (audioNode instanceof OscillatorNode2) 
    {
        controls.appendChild(activateKeyboardButton(audioNode))
    }

    if (node.id === 0) // || node.type === NodeTypes.GAIN) 
    {
        controls.appendChild(gainControls(node))
    }
    else if (HasAudioParams[node.type] && node.type !== NodeTypes.B_SEQ) 
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
            audioNode.getUIComponent(), audioNode.resizeUI.bind(audioNode)))
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
function createResizeableWindow(content : HTMLDivElement, resizeCallback? : any) {
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
    let xy : number[], wh : number[]
    let resizeDirection = 0
    let doLeft = false
    let canvasMinWidth = Infinity
    
    box.onmousedown = doUntilMouseUp(mousemove, { mousedown, mouseup: resizeCallback })

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
        const w = canvas.style.width
        canvas.style.width = '0px'
        canvasMinWidth = canvas.offsetWidth
        canvas.style.width = w
    }

    function mousemove(e : MouseEvent) {

        if (resizeDirection === NONE) return;
        
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

                canvas.parentElement!.parentElement!
                    .parentElement!.parentElement!.parentElement!
                    .style.left = _X + 'px'

                canvas.style.width = Math.max(0, w + x - _X) + 'px'
            }
            else
            {
                canvas.style.width = Math.max(0, w + X - x) + 'px'
            }
        }
        if (resizeDirection & VERTICAL) 
        {
            canvas.style.height = Math.max(0, h + Y - y) + 'px'
        }

    }

    middleRowContainer.append(leftEdge, canvas, rightEdge)
    box.append(topRow, middleRowContainer, bottomRow)

    return box
}

    
function createResizeableCanvasWindow(
content : HTMLCanvasElement) {
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
    let xy : number[], wh : number[]
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

                canvas.parentElement!.parentElement!
                    .parentElement!.parentElement!.parentElement!
                    .style.left = _X + 'px'

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




function showSubtypes(node : NuniGraphNode, saveCallback: Function) : Node {
    const box = E('span')

    // if (HasCustomSubtype[node.type]) //
    if (node.type === NodeTypes.OSC)
    {

        const waves = AudioNodeSubTypes[NodeTypes.OSC]

        const waveTypes = waves.map(name => {
            const img = E('img') as HTMLImageElement
            img.src = `images/${name}.svg`
            img.dataset.name = name
            return img
        })

        ;(box.onclick = setWave)({ target: waveTypes[waves.indexOf(node.audioNode.type)] })
        box.append(...waveTypes)

        return box;
        
        function setWave(e : any) {
            if (!waveTypes.includes(e.target)) return;
            for (const t of waveTypes) 
            {
                const selected = t === e.target
                t.classList.toggle('selected', selected)
                if (selected) 
                {
                    node.audioNode.type = e.target.dataset.name
                }
            }
        }
    }

    const subtypes = AudioNodeSubTypes[node.type]
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




function exposeAudioParams(node : NuniGraphNode, saveCallback : Function) : Node {
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

        const textBox = E('span', { children: [text] })

        // const box = E('div', { className: 'flat-grid some-margin' })
        const box = E('div', { className: 'params-box' })

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

        box.append(textBox, numberInput)

        allParams.appendChild(box)

        
        if (isSubdividable[param]) {
            const subdiv = { subdiv: 0 }
            const subdivSelect = createSubdivSelect(subdiv, { fn: updateParam })

            textBox.append(' ', subdivSelect)

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
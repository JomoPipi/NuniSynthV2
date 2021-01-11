






import { NuniRecordingNode, MasterClock } from "../../internal.js";
import { createSubdivSelect, createSubdivSelect3 } from "../../../nunigraph/view/create_subdivselect.js";
import { SampleSelectComponent } from "../../../UI_library/components/sample_select.js";
import { createVersatileNumberDialComponent } from "../../../UI_library/components/versatile_numberdial.js";
import { createDiscreteDialComponent } from "../../../UI_library/components/discrete_dial.js";







export function audioCaptureNodeControls(audioNode : NuniRecordingNode) {
    const controls = E('div', { className: 'some-margin' })
    let refreshBufferImage
    // let updateProgressLine
    
    const box = E('div', { className: 'flat-grid' })
    choose_buffer_index: {
        const update = (bufferKey : number) => 
            audioNode.bufferKey = bufferKey
            
        const sampleCanvas = 
            new SampleSelectComponent(update, audioNode.bufferKey)

        refreshBufferImage = sampleCanvas.setImage.bind(sampleCanvas)

        box.appendChild(sampleCanvas.html)
    }
    
    // choose_recording_length: {

    //     const subdivisionList = [
    //         0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8,
    //         1.5, 3, 6, 5, 7
    //         ]

    //     const subdivisionToString = (n : number) => 
    //         n <= 1 
    //             ? `${Math.round(1/n)} bars` 
    //             : '1/' + n

    //     const update = (s : string, index : number) => audioNode.subdiv = subdivisionList[index]

    //     const lengthDial = createDiscreteDialComponent(4, subdivisionList.map(subdivisionToString), update)

        
    //     const progressLine = E('canvas')
    //     drawProgressLine: {
    //         const ctx = progressLine.getContext('2d', { alpha: false })!
    //         const h = 2
    //         // const margin = 15
    //         progressLine.height = h
    //         progressLine.width = 130
            
    //         updateProgressLine = (v : number) => {
    //             ctx.fillStyle = '#AB6'
    //             ctx.clearRect(0, 0, progressLine.width, h)
    //             // ctx.fillRect(margin, 0, (progressLine.width - margin * 2) * v, h)
    //             ctx.fillRect(0, 0, progressLine.width * v, h)
    //         }
    //     }

    //     const sync = E('input', 
    //         { props: 
    //             { type: 'checkbox'
    //             , checked: audioNode.isInSync 
    //             , 
    //                 oninput() { 
    //                     audioNode.isInSync = sync.checked
    //                     lengthDial.container.classList.toggle('hide', !sync.checked)
    //                     progressLine.classList.toggle('hide', !sync.checked)
    //                 }
    //             }
    //         })
        const messageBox = E('div')
            messageBox.style.color = 'red'
        
        const recordButton 
            = E('button', 
            { className: 'record'
            , text: 'rec'
            })

        recordButton.onclick = () => 
            audioNode.captureAudioFromStream(recordButton, messageBox)

        box.appendChild(
            recordButton)//, 
            // E('span', { text: 'sync ', children: [sync] }), 
            // E('br'),
            // progressLine,
            // E('br'),  
            // lengthDial.container)

        controls.append(box, messageBox)
    // }

    return { controls, refreshBufferImage }
}
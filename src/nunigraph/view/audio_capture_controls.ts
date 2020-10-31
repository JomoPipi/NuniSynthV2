






import { AudioBufferCaptureNode, MasterClock } from "../../webaudio2/internal.js";
import { BufferUtils } from "../../buffer_utils/internal.js";
import { createSubdivSelect } from "./dialogbox_components.js";







export function audioCaptureNodeControls(audioNode : AudioBufferCaptureNode) {
    const controls = E('div')

    choose_buffer_index: {
        const box = E('span', { text: 'WRITE TO BUFFER: ' })
        
        const value = E('span', { text: 'A' })
        
        // Change the buffer index
        ;['-','+'].forEach((op,i) => {

            const btn = E('button', 
                { text: op
                , className: 'top-bar-btn'
                })

            value.innerText = String.fromCharCode(65 + audioNode.bufferKey)
            btn.onclick = () => {
                const v = clamp(0, 
                    audioNode.bufferKey + Math.sign(i - .5), 
                    BufferUtils.nBuffers-1)

                value.innerText = String.fromCharCode(65 + v)
                audioNode.bufferKey = v
            }

            box.appendChild(btn)
        })

        box.appendChild(value)
        controls.appendChild(box)
    }
    
    choose_recording_length: {

        const value = audioNode.recordingLength
        const subdivSelect = createSubdivSelect(audioNode, { fn: updateSlider })
        const lengthText = E('span', { text: value + 's' })
        const lengthSlider = E('input',
            { props: 
                { type: 'range'
                , min: 0.1
                , max: 20
                , step: 0.1
                , value: audioNode.recordingLength.toString()
                , oninput: () => {
                        const value = lengthSlider.value
                        lengthText.innerText = value + 's'
                        audioNode.recordingLength = +value
                        audioNode.subdiv = 0
                    }
                }
            })

        function updateSlider(value : number) {
            const length = (60 * 4 / MasterClock.getTempo()) / audioNode.subdiv
            lengthText.textContent = length + 's'
            lengthSlider.value = length.toString()
        }

        const box = E('div', { children: [lengthSlider, lengthText, subdivSelect] })
        controls.appendChild(box)
    }

    record_at_start_of_next_measure: {
        const checkbox = E('input', 
            { props: 
                { type: 'checkbox'
                , checked: audioNode.sync 
                }
            })

        controls.append(checkbox, E('span', { text: 'sync' }))

        checkbox.oninput = () => {
            audioNode.sync = checkbox.checked
        }
    }

    record_button: {
        const recordButton 
            = E('button', 
            { className: 'record'
            , text: 'rec'
            })

        recordButton.onclick = () => 
            audioNode.captureAudioFromStream(recordButton)

        controls.appendChild(recordButton)
    }

    return controls
}
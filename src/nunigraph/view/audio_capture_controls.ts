






import { AudioBufferCaptureNode } from "../../webaudio2/record/buffer_capture_node.js";
import { BufferUtils } from "../../buffer_utils/internal.js";







export  function audioCaptureNodeControls(audioNode : AudioBufferCaptureNode) {
    const controls = E('div')

    choose_buffer_index: {
        const box = E('div', { text: 'WRITE TO BUFFER: ' })
        
        const value = E('span', { text: 'A' })
        
        // Change the buffer index
        ;['-','+'].forEach((op,i) => {

            const btn = E('button', {
                text: op,
                className: 'top-bar-btn'
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
        const lengthText = E('span', { text: '2s' })

        const value = audioNode.recordingLength
        lengthText.innerText = value + 's'
        const lengthSlider = E('input', {
            props: {
                type: 'range',
                min: 0.1,
                max: 20,
                step: 0.1,
                value: audioNode.recordingLength.toString(),
                oninput: () => {
                    const value = lengthSlider.value
                    lengthText.innerText = value + 's'
                    audioNode.recordingLength = +value
                }
            }
        })

        const box = E('div', { children: [lengthSlider, lengthText] })
        controls.appendChild(box)
    }

    record_at_start_of_next_measure: {
        const checkbox = E('input', { props: { type: 'checkbox' }})
        controls.append(checkbox, E('br'))
    }

    record_button: {
        const recordButton 
            = E('button', {
            className: 'record',
            text: 'rec'
            })

        recordButton.onclick = () => 
            audioNode.captureAudioFromStream(recordButton)

        controls.appendChild(recordButton)
    }

    return controls
}
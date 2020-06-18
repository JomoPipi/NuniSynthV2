






import AudioBufferCaptureNode from "../../webaudio2/record/buffer_capture_node.js";
import { BufferUtils } from "../../buffer_utils/internal.js";







export default function audioCaptureNodeControls(audioNode : AudioBufferCaptureNode) {
    const controls = E('div')

    choose_buffer_index: {
        const box = E('div')
            box.innerText = 'WRITE TO BUFFER: '
        const value = E('span')
            value.innerText = ' A'
        ;['-','+'].forEach((op,i) => { // change the buffer index
            const btn = E('button')
                btn.innerText = op
                btn.classList.add('top-bar-btn')
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
        const box = E('div')

        const lengthSlider = E('input')
            lengthSlider.type = 'range'
            lengthSlider.min = '0.1'
            lengthSlider.max = '10'
            lengthSlider.step = '0.1'
            lengthSlider.value = audioNode.recordingLength.toString()
        
        const lengthText = E('span')
            lengthText.innerText = '2s'

        lengthSlider.oninput = () => {
            const value = lengthSlider.value
            lengthText.innerText = value + 's'
            audioNode.recordingLength = +value
        }

        box.append(lengthSlider, lengthText)
        controls.appendChild(box)
    }

    record_button: {
        const recordButton = E('button')
            recordButton.classList.add('record')
            recordButton.innerText = 'rec'

        recordButton.onclick = () => 
            audioNode.captureAudioFromStream(recordButton)

        controls.appendChild(recordButton)
    }

    return controls
}
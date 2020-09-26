






import { BufferUtils } from './init_buffers.js'
import { audioCtx } from '../webaudio2/internal.js'
import { BufferStorage } from '../storage/buffer_storage.js'
import { desktopCapture } from './desktop_capture.js'
import { createRadioButtonGroup } from "../UI_library/internal.js"

const MIC = 0, GRAPH = 1, DESKTOP = 2
const recordButtonGroup = 
    createRadioButtonGroup(
    { buttons: ['Mic', 'Graph', 'Desktop']
    , selected: 'Mic'
    , className: 'nunisynth!!'
    , containerClassName: 'rec-buttons-container'
    })

D('record-type-radio-group').appendChild(recordButtonGroup)

export function recordTo(index : number) {
    const recordButton = D('record')

    const errStuff = (err : string) => {
        recordButton.innerText = err
        recordButton.style.backgroundColor = 'orange'
    }

    const isRecording = recordButton.classList.toggle('recording')
    if (!isRecording) 
    {
        clearTimeout(BufferUtils.lastRecorderRequestId)
        BufferUtils.stopLastRecorder()
        return;
    }

    log('recording...')
    const selected = recordButtonGroup.dataset.selected!

    // @ts-ignore - Unleash the power of the double equal. Muahahaha!
    if (selected == MIC) 
    {
        navigator
            .mediaDevices
            .getUserMedia({ audio: true })
            .then(handleStream)
            .catch(errStuff)
    }
    // @ts-ignore - Unleash the power of the double equal. Muahahaha!
    else if (selected == GRAPH)
    {
        const mediaStreamDestination = 
            audioCtx.createMediaStreamDestination()

        audioCtx.volume.connect(mediaStreamDestination)

        handleStream(
            mediaStreamDestination.stream,
            () => audioCtx.volume.disconnect(mediaStreamDestination))
    }
    // @ts-ignore - Unleash the power of the double equal. Muahahaha!
    else if (selected == DESKTOP)
    {
        // Delay the active recording color until they've actually chosen what to record
        recordButton.classList.toggle('recording')

        const mediaStreamDestination = 
            audioCtx.createMediaStreamDestination()

        audioCtx.volume.connect(mediaStreamDestination)

        desktopCapture(
            (stream : MediaStream) => {
                // Now we record
                recordButton.classList.toggle('recording')
                handleStream(
                    stream, 
                    () => audioCtx.volume.disconnect(mediaStreamDestination))
            })
    }
    else
    {
        throw 'Weird Error'
    }

    function handleStream(stream : MediaStream, f? : Function) {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.start()

        const audioChunks : Blob[] = []
        
        mediaRecorder.addEventListener('dataavailable', (event : Indexed) => {
            audioChunks.push(event.data)
        })

        mediaRecorder.addEventListener('stop', async () => {
            const audioBlob = new Blob(audioChunks)

            try {
                const arraybuffer = await audioBlob.arrayBuffer()
                const audiobuffer = await audioCtx.decodeAudioData(arraybuffer)
                const rate =  audioCtx.sampleRate

                // This new buffer ensures that the length is exact
                const buffer = 
                    audioCtx.createBuffer(
                    1, 
                    BufferUtils.nextBufferDuration * rate,
                    rate)
                buffer.copyToChannel(audiobuffer.getChannelData(0), 0)

                BufferStorage.set(index, buffer)
                BufferUtils.refreshAffectedBuffers()
                recordButton.classList.remove('recording')
                BufferUtils.updateBufferUI()
                f && f()
            } catch (e) {
                errStuff(e)
            }
        })

        BufferUtils.stopLastRecorder = () => mediaRecorder.stop()
        BufferUtils.lastRecorderRequestId = 
            setTimeout(
                BufferUtils.stopLastRecorder, 
                BufferUtils.nextBufferDuration * 1000)
    }
}
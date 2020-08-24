






import { BufferUtils } from './init_buffers.js'
import { audioCtx } from '../webaudio2/internal.js'
import { BufferStorage } from '../storage/buffer_storage.js'

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

    if ((D('record-mic') as HTMLInputElement).checked) 
    {
        navigator
            .mediaDevices
            .getUserMedia({ audio: true })
            .then(handleStream)
            .catch(errStuff)
    } 
    else 
    {
        const mediaStreamDestination = 
            audioCtx.createMediaStreamDestination()

        audioCtx.volume.connect(mediaStreamDestination)

        handleStream(
            mediaStreamDestination.stream,
            () => audioCtx.volume.disconnect(mediaStreamDestination))
    }

    function handleStream(stream : MediaStream, f? : Function) {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.start()

        const audioChunks : Blob[] = []
        
        mediaRecorder.addEventListener('dataavailable', (event : Indexed) => {
            audioChunks.push(event.data)
        })

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks)

            audioBlob.arrayBuffer().then(arraybuffer => {
                audioCtx.decodeAudioData(arraybuffer)
                .then((audiobuffer : AudioBuffer) => 
                {
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
                })
                .catch(errStuff)
            })
            .catch(errStuff)
        })

        BufferUtils.stopLastRecorder = () => mediaRecorder.stop()
        BufferUtils.lastRecorderRequestId = 
            setTimeout(
                BufferUtils.stopLastRecorder, 
                BufferUtils.nextBufferDuration * 1000)
    }
}
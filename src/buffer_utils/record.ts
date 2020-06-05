






import { bufferController } from './init_buffers.js'
import { audioCtx } from '../webaudio2/webaudio2.js'

export function recordTo(index : number) {
    const recordButton = D('record')!

    const errStuff = (err : string) => {
        recordButton.innerText = err
        recordButton.style.backgroundColor = 'orange'
    }

    const isRecording = recordButton.classList.toggle('recording')
    if (!isRecording) {
        clearTimeout(bufferController.lastRecorderRequestId)
        bufferController.stopLastRecorder()
        return;
    }

    log('recording...')

    if ((<HTMLInputElement>D('record-mic')).checked) {
        navigator
            .mediaDevices
            .getUserMedia({ audio: true })
            .then(handleStream)
            .catch(errStuff)

    } else {
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
            log('event.prototype',event.data)
            log('event.data =',event.data.arrayBuffer()) 
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
                        bufferController.nextBufferDuration * rate,
                        rate)
                    buffer.copyToChannel(audiobuffer.getChannelData(0), 0)

                    bufferController.buffers[index] = buffer
                    bufferController.refreshAffectedBuffers()
                    recordButton.classList.remove('recording')
                    bufferController.updateBufferUI()
                    f && f()
                })
                .catch(errStuff)
            })
            .catch(errStuff)
        })

        bufferController.stopLastRecorder = () => mediaRecorder.stop()
        bufferController.lastRecorderRequestId = 
            setTimeout(
                bufferController.stopLastRecorder, 
                bufferController.nextBufferDuration * 1000)
    }
}
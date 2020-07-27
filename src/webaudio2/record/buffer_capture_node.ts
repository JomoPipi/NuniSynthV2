






import { BufferUtils } from '../../buffer_utils/init_buffers.js'
import { BufferStorage } from '../../storage/general/buffer_storage.js'

export class AudioBufferCaptureNode extends MediaStreamAudioDestinationNode {

    ctx : AudioContext
    bufferKey : number
    recordingLength : number
    sync : boolean

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.bufferKey = 0
        this.recordingLength = 2
        this.sync = true
    }

    captureAudioFromStream(recordButton : HTMLElement) {

        const isRecording = recordButton.classList.contains('recording')
        if (isRecording) 
        {
            recordButton.classList.remove('recording')
            clearTimeout(BufferUtils.lastRecorderRequestId)
            BufferUtils.stopLastRecorder()
            return;
        }
    
        const time = this.ctx.currentTime
        const startTime = this.sync 
            ? ((time / 4 | 0) + 1) * 4 // when the next measure starts 
            : time
        const delta = startTime - time

        setTimeout(() => recordButton.classList.add('recording'), 1000 * delta)
        
        const errStuff = (err : string) => {
            recordButton.innerText = err
            recordButton.style.backgroundColor = 'orange'
        }
        
        const mediaRecorder = new MediaRecorder(this.stream)
        mediaRecorder.start(startTime)

        const audioChunks : Blob[] = []
        
        mediaRecorder.addEventListener('dataavailable', (event : Indexed) => {
            audioChunks.push(event.data)
        })

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks)

            audioBlob.arrayBuffer().then(arraybuffer => {
                this.ctx.decodeAudioData(arraybuffer)
                .then((audiobuffer : AudioBuffer) => 
                {
                    const rate =  this.ctx.sampleRate

                    // This new buffer ensures that the length is exact
                    const buffer = 
                        this.ctx.createBuffer(
                        1, 
                        this.recordingLength * rate,
                        rate)
                    buffer.copyToChannel(audiobuffer.getChannelData(0), 0)

                    BufferStorage.set(this.bufferKey, buffer)
                    BufferUtils.refreshAffectedBuffers()
                    recordButton.classList.remove('recording')
                    // BufferUtils.updateBufferUI()
                })
                .catch(errStuff)
            })
            .catch(errStuff)
        })

        BufferUtils.stopLastRecorder = () => mediaRecorder.stop()
        BufferUtils.lastRecorderRequestId = 
            setTimeout(
                BufferUtils.stopLastRecorder, 
                (this.recordingLength + delta) * 1000)
    }
}
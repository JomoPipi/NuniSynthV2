






import { BufferUtils } from '../../buffer_utils/internal.js'
import BufferStorage from '../../storage/general/buffer_storage.js'

export default class AudioBufferCaptureNode extends MediaStreamAudioDestinationNode {

    ctx : AudioContext
    bufferKey : number
    recordingLength : number

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.bufferKey = 0
        this.recordingLength = 2
    }

    captureAudioFromStream(recordButton : HTMLElement) {

        const isRecording = recordButton.classList.toggle('recording')
        if (!isRecording) {
            clearTimeout(BufferUtils.lastRecorderRequestId)
            BufferUtils.stopLastRecorder()
            return;
        }
        
        const errStuff = (err : string) => {
            recordButton.innerText = err
            recordButton.style.backgroundColor = 'orange'
        }



        
        const mediaRecorder = new MediaRecorder(this.stream)
        mediaRecorder.start()

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
                this.recordingLength * 1000)
    }
}







import { BufferUtils } from '../../../buffer_utils/init_buffers.js'
import { BufferStorage } from '../../../storage/buffer_storage.js'
import { MasterClock } from '../../sequencers/master_clock.js'

export class NuniRecordingNode 
    extends MediaStreamAudioDestinationNode
    implements AudioNodeInterfaces<NodeTypes.RECORD> {

    ctx : AudioContext
    bufferKey : number
    recordingLength : number
    sync : boolean
    subdiv : number // if subdiv === 0 we use recording length

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.bufferKey = 0
        this.recordingLength = 2
        this.sync = true
        this.subdiv = 0.5
    }

    captureAudioFromStream(recordButton : HTMLElement) {

        const isRecording = recordButton.classList.contains('recording')
        if (isRecording) 
        {
            recordButton.innerText = 'rec'
            recordButton.classList.remove('record-error')
            recordButton.classList.remove('recording')
            clearTimeout(BufferUtils.lastRecorderRequestId)
            BufferUtils.stopLastRecorder()
            return;
        }

        const errStuff = (err : string) => {
            recordButton.innerText = err
            recordButton.classList.add('record-error')
        }
    
        const mediaRecorder = new MediaRecorder(this.stream)
        const time = this.ctx.currentTime
        const startTime = this.sync 
            ? ((time / 4 | 0) + 1) * 4 // when the next measure starts 
            : time
        const delta = startTime - time

        const audioChunks : Blob[] = []

        setTimeout(() => {
            recordButton.classList.add('recording')
            mediaRecorder.start()

            mediaRecorder.addEventListener('dataavailable', (event : Indexed) => {
                audioChunks.push(event.data)
            })
        }, 1000 * delta)
        
        const recordLength = this.subdiv === 0
            ? this.recordingLength
            : (60 * 4 / MasterClock.getTempo()) / this.subdiv

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks)

            audioBlob.arrayBuffer()
                .then(arraybuffer => this.ctx.decodeAudioData(arraybuffer))
                .then((audiobuffer : AudioBuffer) => {
                    const rate =  this.ctx.sampleRate

                    // This new buffer ensures that the length is exact
                    const buffer = 
                        this.ctx.createBuffer(
                        1,
                        recordLength * rate,
                        rate)
                    buffer.copyToChannel(audiobuffer.getChannelData(0), 0)

                    BufferStorage.set(this.bufferKey, buffer)
                    BufferUtils.refreshAffectedBuffers(this.bufferKey)
                    recordButton.classList.remove('recording')
                    BufferUtils.updateBufferUI()
                })
                .catch(errStuff)
        })

        BufferUtils.stopLastRecorder = () => {
            if (mediaRecorder.state === 'inactive') 
            {
                return console.warn('What are you doing to the mediaRecorder?')
            }
            mediaRecorder.stop()
        }
        
        BufferUtils.lastRecorderRequestId = 
            setTimeout(
                BufferUtils.stopLastRecorder, 
                (this.subdiv === 0 
                    ? this.recordingLength
                    : (60 * 4 / MasterClock.getTempo()) / this.subdiv
                ) * 1020 + delta * 1020) // Going for 2% longer, here
    }
}
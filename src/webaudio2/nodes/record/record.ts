






import { BufferUtils } from '../../../buffer_utils/init_buffers.js'
import { BufferStorage } from '../../../storage/buffer_storage.js'
import { MasterClock } from '../../sequencers/master_clock.js'
import { audioCaptureNodeControls } from './record_controls.js'

export class NuniRecordingNode 
    extends MediaStreamAudioDestinationNode
    implements AudioNodeInterfaces<NodeTypes.RECORD> {

    ctx : AudioContext
    bufferKey : number
    // recordingLength : number
    // isInSync : boolean
    // subdiv : number // if subdiv === 0 we use recording length
    refreshBufferImage = () => {}
    // updateProgressLine = (percent : number) => {}

    // readonly isPlaying = false // Required property of ClockDependent nodes
    // private dialogBoxIsOpen = false
    private controller? : HTMLElement

    // ! This thing just records until we hit the record button again

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.bufferKey = 0
        // this.recordingLength = 2
        // this.isInSync = true
        // this.subdiv = 0.5
    }

    getController() : HTMLElement {
        // this.dialogBoxIsOpen = true
        if (this.controller) return this.controller
        const { controls, refreshBufferImage } = audioCaptureNodeControls(this)
        this.refreshBufferImage = refreshBufferImage
        // this.updateProgressLine = updateProgressLine
        this.controller = controls
        return controls
    }

    // scheduleNotes() {
    //     if (this.isInSync && this.dialogBoxIsOpen)
    //     {
    //         const time = this.ctx.currentTime
    //         const phase = 0 // this.phaseShift * this.durationOfLoop
    //         const currentTime = time + phase
    //         const durationOfLoop = 60 * 4 / (MasterClock.getTempo() * this.subdiv)
    //         const percentage = ((currentTime + 0.200) % durationOfLoop) / durationOfLoop
    //         this.updateProgressLine(percentage)
    //     }
    // }
    // sync() {}
    // setTempo(t : number) {}

    // deactivateWindow() { this.dialogBoxIsOpen = false }

    captureAudioFromStream(recordButton : HTMLElement, messageBox? : HTMLElement) {

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
        
        if (messageBox) messageBox.innerText = ''
        const errStuff = (err : string) => {
            const msg = 'Input(s) Required.'
            if (messageBox)
            {
                messageBox.innerText = msg
            }
            else
            {
                recordButton.innerText = msg
            }
            recordButton.classList.add('record-error')
        }
        const mediaRecorder = new MediaRecorder(this.stream)
        // const time = this.ctx.currentTime
        // const durationOfLoop = 60 * 4 / (MasterClock.getTempo() * this.subdiv)
        // const startTime = this.isInSync 
        //     ? ((time / 4 | 0) + 1) * 4 // when the next measure starts 
        //     : time
        // const delta = startTime - time

        const audioChunks : Blob[] = []

        // setTimeout(() => {
            recordButton.classList.add('recording')
            mediaRecorder.start()

            mediaRecorder.addEventListener('dataavailable', (event : Indexed) => {
                audioChunks.push(event.data)
            })
        // }, 1000 * delta)
        
        // const recordLength = this.subdiv === 0
        //     ? this.recordingLength
        //     : (60 * 4 / MasterClock.getTempo()) / this.subdiv

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks)

            audioBlob.arrayBuffer()
                .then(arraybuffer => this.ctx.decodeAudioData(arraybuffer))
                .then((audiobuffer : AudioBuffer) => {
                    // const rate =  this.ctx.sampleRate

                    // This new buffer ensures that the length is exact
                    // const buffer = 
                    //     this.ctx.createBuffer(
                    //     1,
                    //     recordLength * rate,
                    //     rate)
                    // buffer.copyToChannel(audiobuffer.getChannelData(0), 0)

                    BufferStorage.set(this.bufferKey, audiobuffer)
                    BufferUtils.refreshBuffer(this.bufferKey)
                    recordButton.classList.remove('recording')
                    BufferUtils.updateCurrentBufferImage()
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
                20 * 1000) // Turn it off after 20 seconds

                // (this.subdiv === 0 
                //     ? this.recordingLength
                //     : (60 * 4 / MasterClock.getTempo()) / this.subdiv
                // ) * 1020 + delta * 1020) // Going for 2% longer, here
    }
}
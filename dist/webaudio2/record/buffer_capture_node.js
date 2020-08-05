import { BufferUtils } from '../../buffer_utils/init_buffers.js';
import { BufferStorage } from '../../storage/general/buffer_storage.js';
import { MasterClock } from '../sequencers/master_clock.js';
export class AudioBufferCaptureNode extends MediaStreamAudioDestinationNode {
    constructor(ctx) {
        super(ctx);
        this.ctx = ctx;
        this.bufferKey = 0;
        this.recordingLength = 2;
        this.sync = true;
        this.subdiv = 0.5;
    }
    captureAudioFromStream(recordButton) {
        const isRecording = recordButton.classList.contains('recording');
        if (isRecording) {
            recordButton.classList.remove('recording');
            clearTimeout(BufferUtils.lastRecorderRequestId);
            BufferUtils.stopLastRecorder();
            return;
        }
        const errStuff = (err) => {
            recordButton.innerText = err;
            recordButton.style.backgroundColor = 'orange';
        };
        const mediaRecorder = new MediaRecorder(this.stream);
        const time = this.ctx.currentTime;
        const startTime = this.sync
            ? ((time / 4 | 0) + 1) * 4
            : time;
        const delta = startTime - time;
        const audioChunks = [];
        setTimeout(() => {
            recordButton.classList.add('recording');
            mediaRecorder.start();
            mediaRecorder.addEventListener('dataavailable', (event) => {
                audioChunks.push(event.data);
            });
        }, 1000 * delta);
        const recordLength = this.subdiv === 0
            ? this.recordingLength
            : (60 * 4 / MasterClock.getTempo()) / this.subdiv;
        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks);
            audioBlob.arrayBuffer().then(arraybuffer => {
                this.ctx.decodeAudioData(arraybuffer)
                    .then((audiobuffer) => {
                    const rate = this.ctx.sampleRate;
                    const buffer = this.ctx.createBuffer(1, recordLength * rate, rate);
                    buffer.copyToChannel(audiobuffer.getChannelData(0), 0);
                    BufferStorage.set(this.bufferKey, buffer);
                    BufferUtils.refreshAffectedBuffers(this.bufferKey);
                    recordButton.classList.remove('recording');
                    BufferUtils.updateBufferUI();
                })
                    .catch(errStuff);
            })
                .catch(errStuff);
        });
        BufferUtils.stopLastRecorder = () => {
            if (mediaRecorder.state === 'inactive') {
                return console.warn('What are you doing to the mediaRecorder?');
            }
            mediaRecorder.stop();
        };
        BufferUtils.lastRecorderRequestId =
            setTimeout(BufferUtils.stopLastRecorder, (this.subdiv === 0
                ? this.recordingLength
                : (60 * 4 / MasterClock.getTempo()) / this.subdiv) * 1010 + delta * 1010);
    }
}
//# sourceMappingURL=buffer_capture_node.js.map
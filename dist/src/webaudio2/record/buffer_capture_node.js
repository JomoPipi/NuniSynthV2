import { BufferUtils } from '../../buffer_utils/init_buffers.js';
import { BufferStorage } from '../../storage/general/buffer_storage.js';
export class AudioBufferCaptureNode extends MediaStreamAudioDestinationNode {
    constructor(ctx) {
        super(ctx);
        this.ctx = ctx;
        this.bufferKey = 0;
        this.recordingLength = 2;
        this.sync = true;
    }
    captureAudioFromStream(recordButton) {
        const isRecording = recordButton.classList.contains('recording');
        if (isRecording) {
            recordButton.classList.remove('recording');
            clearTimeout(BufferUtils.lastRecorderRequestId);
            BufferUtils.stopLastRecorder();
            return;
        }
        const time = this.ctx.currentTime;
        const startTime = this.sync
            ? ((time / 4 | 0) + 1) * 4
            : time;
        const delta = startTime - time;
        setTimeout(() => recordButton.classList.add('recording'), 1000 * delta);
        const errStuff = (err) => {
            recordButton.innerText = err;
            recordButton.style.backgroundColor = 'orange';
        };
        const mediaRecorder = new MediaRecorder(this.stream);
        mediaRecorder.start(startTime);
        const audioChunks = [];
        mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
        });
        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks);
            audioBlob.arrayBuffer().then(arraybuffer => {
                this.ctx.decodeAudioData(arraybuffer)
                    .then((audiobuffer) => {
                    const rate = this.ctx.sampleRate;
                    const buffer = this.ctx.createBuffer(1, this.recordingLength * rate, rate);
                    buffer.copyToChannel(audiobuffer.getChannelData(0), 0);
                    BufferStorage.set(this.bufferKey, buffer);
                    BufferUtils.refreshAffectedBuffers();
                    recordButton.classList.remove('recording');
                })
                    .catch(errStuff);
            })
                .catch(errStuff);
        });
        BufferUtils.stopLastRecorder = () => mediaRecorder.stop();
        BufferUtils.lastRecorderRequestId =
            setTimeout(BufferUtils.stopLastRecorder, (this.recordingLength + delta) * 1000);
    }
}
//# sourceMappingURL=buffer_capture_node.js.map
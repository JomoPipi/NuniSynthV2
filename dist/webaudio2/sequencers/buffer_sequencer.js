import { ADSR_Controller } from "../adsr.js";
import { Sequencer } from "./sequencer.js";
import { NuniAudioParam } from "../nuni_audioparam.js";
import { BufferStorage } from "../../storage/buffer_storage.js";
import { BufferUtils } from "../../buffer_utils/init_buffers.js";
export class SampleSequencer extends Sequencer {
    constructor(ctx) {
        super(ctx);
        this.nextId = 0;
        this.detune = new NuniAudioParam(ctx);
        this.playbackRate = new NuniAudioParam(ctx);
        this.addInput();
    }
    addInput() {
        this.channelData[this.nextId] =
            { volume: 1,
                bufferKey: 0
            };
        this.stepMatrix[this.nextId] = this.createStepRow();
        this.nextId++;
        this.refresh();
    }
    removeInput(key) {
        delete this.channelData[key];
        delete this.stepMatrix[key];
        this.refresh();
    }
    createSource(id) {
        const { bufferKey } = this.channelData[id];
        const src = this.ctx.createBufferSource();
        src.playbackRate.setValueAtTime(0, this.ctx.currentTime);
        this.detune.connect(src.detune);
        this.playbackRate.connect(src.playbackRate);
        src.buffer = BufferStorage.get(bufferKey);
        return src;
    }
    playStepAtTime(id, time) {
        const duration = this.tick;
        const src = this.createSource(id);
        const { volume } = this.channelData[id];
        const adsr = new GainNode(this.ctx);
        adsr.gain.setValueAtTime(0, 0);
        adsr.connect(this.volumeNode);
        src.connect(adsr);
        ADSR_Controller.triggerSource(src, adsr.gain, time, volume, this.adsrIndex);
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time + duration, this.adsrIndex);
        src.stop(stopTime);
    }
    additionalRowItems(key) {
        const box = E('span');
        const valueText = E('span', { text: String.fromCharCode(65 + this.channelData[key].bufferKey) });
        add_buffer_select: {
            ;
            ['-', '+'].forEach((op, i) => {
                const btn = E('button', { text: op,
                    className: 'top-bar-btn'
                });
                btn.onclick = () => {
                    const v = clamp(0, this.channelData[key].bufferKey + Math.sign(i - .5), BufferUtils.nBuffers - 1);
                    valueText.innerText = String.fromCharCode(65 + v);
                    this.channelData[key].bufferKey = v;
                };
                box.appendChild(btn);
            });
            box.appendChild(valueText);
        }
        delete_row_select: {
            const deleteNodeBtn = E('button', { text: '🗑️',
                className: 'top-bar-btn'
            });
            deleteNodeBtn.onclick = () => this.removeInput(key);
            box.append(deleteNodeBtn);
        }
        return box;
    }
}
//# sourceMappingURL=buffer_sequencer.js.map
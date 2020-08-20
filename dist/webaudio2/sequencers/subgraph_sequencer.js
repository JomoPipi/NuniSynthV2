import { ADSR_Controller } from '../adsr.js';
import { Sequencer } from './sequencer.js';
export class SubgraphSequencer extends Sequencer {
    constructor() {
        super(...arguments);
        this.channelEnvelopes = {};
    }
    addInput({ id, audioNode }) {
        this.channelData[id] = { volume: 1 };
        const adsr = this.channelEnvelopes[id] = new GainNode(this.ctx);
        adsr.gain.value = 0;
        audioNode.connect(adsr);
        adsr.connect(this.volumeNode);
        this.stepMatrix[id] = this.createStepRow();
        this.refresh();
    }
    refresh() {
        for (const key in this.channelEnvelopes) {
            this.channelEnvelopes[key].connect(this.volumeNode);
        }
        Sequencer.prototype.refresh.call(this);
    }
    removeInput({ id }) {
        this.channelEnvelopes[id].disconnect();
        delete this.channelEnvelopes[id];
        delete this.channelData[id];
        delete this.stepMatrix[id];
        this.refresh();
    }
    playStepAtTime(id, time) {
        const { volume } = this.channelData[id];
        const adsr = this.channelEnvelopes[id];
        const gain = adsr.gain;
        const duration = this.tick;
        ADSR_Controller.trigger(gain, time, volume, this.adsrIndex);
        ADSR_Controller.untriggerAdsr(gain, time + duration, this.adsrIndex);
    }
    replaceInput({ id, audioNode }, newNode) {
        this.addInput(newNode);
        this.channelData[newNode.id] = this.channelData[id];
        this.stepMatrix[newNode.id] = this.stepMatrix[id];
        this.removeInput({ id, audioNode });
    }
}
//# sourceMappingURL=subgraph_sequencer.js.map
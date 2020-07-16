import { ADSR_Controller } from '../adsr.js';
import { Sequencer } from './sequencer.js';
export class SubgraphSequencer extends Sequencer {
    constructor(ctx) {
        super(ctx);
    }
    addInput({ id, audioNode }) {
        this.channelData[id] = {
            volume: 1
        };
        const adsr = this.channelData[id].adsr = new GainNode(this.ctx);
        adsr.gain.value = 0;
        audioNode.connect(adsr);
        adsr.connect(this.volumeNode);
        this.stepMatrix[id] = this.createStepRow();
        this.refresh();
    }
    removeInput({ id }) {
        this.channelData[id].adsr.disconnect();
        delete this.channelData[id];
        delete this.stepMatrix[id];
        this.refresh();
    }
    playStepAtTime(id, time) {
        const { adsr, volume } = this.channelData[id];
        const gain = adsr.gain;
        const duration = this.tick;
        ADSR_Controller.trigger(gain, time, volume, this.adsrIndex);
        ADSR_Controller.untriggerAdsr(gain, time + duration, this.adsrIndex);
    }
}
//# sourceMappingURL=subgraph_sequencer.js.map
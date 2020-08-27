import { NuniSourceNode } from './nuni_source_node.js';
import { NuniAudioParam } from '../nuni_audioparam.js';
import { waveform } from '../../waveform_utils/mutable_waveform.js';
export class OscillatorNode2 extends NuniSourceNode {
    constructor(ctx) {
        super(ctx);
        this._type = 'sine';
        this.detune = new NuniAudioParam(ctx);
        this.frequency = new NuniAudioParam(ctx);
        this.kbMode = false;
    }
    set type(t) {
        if (this.soloSource) {
            if (t === 'custom') {
                console.log('wave =', waveform.wave);
                this.soloSource.setPeriodicWave(waveform.wave);
            }
            else {
                this.soloSource.type = t;
            }
        }
        this._type = t;
    }
    get type() { return this._type; }
    createSource() {
        const src = this.ctx.createOscillator();
        src.frequency.setValueAtTime(0, this.ctx.currentTime);
        this.detune.connect(src.detune);
        this.frequency.connect(src.frequency);
        if (this._type === 'custom') {
            src.setPeriodicWave(waveform.wave);
        }
        else {
            src.type = this._type;
        }
        return src;
    }
}
//# sourceMappingURL=oscillator2.js.map
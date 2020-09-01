import { NuniSourceNode } from './nuni_source_node.js';
import { NuniAudioParam } from '../nuni_audioparam.js';
import { createPeriodicWave } from '../../waveform_utils/mutable_waveform.js';
export class OscillatorNode2 extends NuniSourceNode {
    constructor(ctx) {
        super(ctx);
        this._type = 'sine';
        this.detune = new NuniAudioParam(ctx);
        this.frequency = new NuniAudioParam(ctx);
        this.kbMode = false;
        this.customWave = ctx.createPeriodicWave(new Float32Array([0, 1 / 1, 1 / 2, 1 / 8, 1 / 8, 1 / 25, 1 / 32, 1 / 8]), new Float32Array([0, 1 / 3, 1 / 2, 1 / 4, 1 / 800, 1 / 65, 1 / 9, 1 / 37]));
    }
    set type(t) {
        console.log('t =', t, this.soloSource);
        if (this.soloSource) {
            log('truthy ?', t === 'custom');
            if (t === 'custom') {
                this.soloSource.setPeriodicWave(this.customWave = createPeriodicWave(this.ctx));
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
            src.setPeriodicWave(this.customWave);
        }
        else {
            src.type = this._type;
        }
        return src;
    }
}
//# sourceMappingURL=oscillator2.js.map
import { NuniSourceNode } from './nuni_source_node.js';
import { NuniAudioParam } from '../nuni_audioparam.js';
export class OscillatorNode2 extends NuniSourceNode {
    constructor(ctx) {
        super(ctx);
        this._type = 'sine';
        this.detune = new NuniAudioParam(ctx);
        this.frequency = new NuniAudioParam(ctx);
        this.kbMode = false;
    }
    set type(t) {
        if (this.soloSource)
            this.soloSource.type = t;
        this._type = t;
    }
    get type() { return this._type; }
    createSource() {
        const src = this.ctx.createOscillator();
        src.frequency.setValueAtTime(0, this.ctx.currentTime);
        this.detune.connect(src.detune);
        this.frequency.connect(src.frequency);
        src.type = this._type;
        return src;
    }
}
//# sourceMappingURL=oscillator2.js.map
import { NuniSourceNode } from './nuni_source_node.js';
import { NuniAudioParam } from '../nuni_audioparam.js';
import { BufferStorage } from '../../storage/general/buffer_storage.js';
export class BufferNode2 extends NuniSourceNode {
    constructor(ctx) {
        super(ctx);
        this.loop = true;
        this.bufferKey = 0;
        this.detune = new NuniAudioParam(ctx);
        this.playbackRate = new NuniAudioParam(ctx);
        this.kbMode = false;
    }
    createSource() {
        const src = this.ctx.createBufferSource();
        src.playbackRate.setValueAtTime(0, this.ctx.currentTime);
        this.detune.connect(src.detune);
        this.playbackRate.connect(src.playbackRate);
        src.buffer = BufferStorage.get(this.bufferKey);
        src.loop = this.loop;
        return src;
    }
}
//# sourceMappingURL=buffer2.js.map
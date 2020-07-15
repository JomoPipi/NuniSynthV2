import { BufferNode2 } from './note_in/buffer2.js';
import { OscillatorNode2 } from './note_in/oscillator2.js';
import { SubgraphSequencer } from './sequencers/subgraph_sequencer.js';
import { BufferSequencer } from './sequencers/buffer_sequencer.js';
import { graphVisualEqualizer } from './equalizer/global_visualizer.js';
import { AudioBufferCaptureNode } from './record/buffer_capture_node.js';
import { NuniGraphAudioNode } from './nunigraph_audionode.js';
export class AudioContext2 extends AudioContext {
    constructor() {
        super();
        this.analyser = this.createAnalyser();
        this.analyser.connect(this.destination);
        this.volume = this.createGain();
        this.volume.connect(this.analyser);
        graphVisualEqualizer(this.analyser);
    }
    createBuffer2() {
        return new BufferNode2(this);
    }
    createOscillator2() {
        return new OscillatorNode2(this);
    }
    createSubgraphSequencer() {
        return new SubgraphSequencer(this);
    }
    createBufferSequencer() {
        return new BufferSequencer(this);
    }
    createAudioBufferCaptureNode() {
        return new AudioBufferCaptureNode(this);
    }
    createCustomNode() {
        return new NuniGraphAudioNode(this);
    }
}
export const audioCtx = new AudioContext2();
//# sourceMappingURL=webaudio2.js.map
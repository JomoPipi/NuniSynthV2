






import { BufferNode2 } from './note_in/buffer2.js'
import { OscillatorNode2 } from './note_in/oscillator2.js'
import { GateSequencer } from './sequencers/subgraph_sequencer.js'
import { SampleSequencer } from './sequencers/buffer_sequencer.js'
import { graphVisualEqualizer } from '../visualizer/global_visualizer.js'
import { AudioBufferCaptureNode } from './record/buffer_capture_node.js'
import { NuniGraphAudioNode } from './nunigraph_audionode.js'
import { Envelope } from './envelope/envelope.js'
import { PianoRoll12Tone } from './sequencers/pianoroll_12tone.js'


class AudioContext2 extends AudioContext {
    /** con·text    /ˈkäntekst/ 
     *  noun
     *      "the circumstances that form the setting for an event, 
     *      statement, or idea, and in terms of which it can be 
     *      fully understood and assessed."
     */

    volume : GainNode
    analyser : AnalyserNode

    constructor() {
        super()
        this.analyser = this.createAnalyser()
        this.analyser.connect(this.destination)

        this.volume = this.createGain()
        this.volume.connect(this.analyser)

        graphVisualEqualizer(this.analyser)
    }


    createBuffer2() {
        return new BufferNode2(this)
    }

    createOscillator2() {
        return new OscillatorNode2(this) 
    }

    createGateSequencer() {
        return new GateSequencer(this)
    }

    createSampleSequencer() {
        return new SampleSequencer(this)
    }

    createAudioBufferCaptureNode() {
        return new AudioBufferCaptureNode(this)
    }
    
    createNuniGraphAudioNode() {
        return new NuniGraphAudioNode(this)
    }

    createEnvelopeNode() {
        return new Envelope(this)
    }

    create12TonePianoRoll() {
        return new PianoRoll12Tone(this)
    }

    createProcessorNode() {
        const audioWorkletNode = new AudioWorkletNode(this, 'white-noise-processor')
        return audioWorkletNode
    }

    createCompressorNode() {
        return new DynamicsCompressorNode(this)
    }
}

export const audioCtx = new AudioContext2()

audioCtx.audioWorklet.addModule('dist/webaudio2/white-noise-processor.js')
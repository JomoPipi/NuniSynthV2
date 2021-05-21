






import { graphVisualEqualizer } from '../visualizer/global_visualizer.js'

import { NuniSampleNode } from './nodes/sample/sample.js'
import { OscillatorNode2 } from './nodes/oscillator/oscillator.js'
import { GateSequencer } from './nodes/gate_sequencer/subgraph_sequencer.js'
import { SampleSequencer } from './nodes/sample_sequencer/sample_sequencer.js'
import { NuniRecordingNode } from './nodes/record/record.js'
import { NuniGraphAudioNode } from './nodes/module/module.js'

// import { PianoRoll12Tone } from './nodes/pianoroll/pianoroll_12tone.js'
import { MonoPianoRoll } from './nodes/pianoroll/mono_pianoroll.js'
import { SamplePianoRoll } from './nodes/samplepianoroll/samplepianoroll.js'
import { ProcessorNode } from './nodes/processor/processor.js'
import { AutomationNode } from './nodes/automation/automation.js'
import { NuniFilterNode } from './nodes/filter/filter.js'
import { KeyboardGate } from './nodes/keyboard_gate.ts/kb_gate.js'

export const AudioNodeMap = 
    { [NodeTypes.OUTPUT]:        GainNode
    , [NodeTypes.GAIN]:          GainNode
    , [NodeTypes.OSC]:           OscillatorNode2
    , [NodeTypes.FILTER]:        NuniFilterNode
    , [NodeTypes.PANNER]:        StereoPannerNode
    , [NodeTypes.DELAY]:         DelayNode
    , [NodeTypes.SAMPLE]:        NuniSampleNode
    , [NodeTypes.G_SEQ]:         GateSequencer
    , [NodeTypes.S_SEQ]:         SampleSequencer
    , [NodeTypes.NUM]:           ConstantSourceNode
    , [NodeTypes.RECORD]:        NuniRecordingNode
    , [NodeTypes.MODULE]:        NuniGraphAudioNode
    , [NodeTypes.COMPRESSOR]:    DynamicsCompressorNode

    // , [NodeTypes.PIANOR]:     PianoRoll12Tone
    , [NodeTypes.PIANOR]:        MonoPianoRoll

    , [NodeTypes.PROCESSOR]:     ProcessorNode
    , [NodeTypes.AUTO]:          AutomationNode
    , [NodeTypes.SAMPLE_PIANOR]: SamplePianoRoll
    , [NodeTypes.KB_GATE]:       KeyboardGate
    } as const

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

    createNode<T extends NodeTypes>(type : T) : InstanceType<typeof AudioNodeMap[T]> {
        return new AudioNodeMap[type](this)  as InstanceType<typeof AudioNodeMap[T]>
    }
}

export const audioCtx = new AudioContext2()

audioCtx.audioWorklet.addModule('dist/webaudio2/nodes/processor/bypass-processor.js')
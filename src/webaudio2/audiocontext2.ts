






import { NuniSampleNode } from './nodes/sample/sample_node.js'
import { OscillatorNode2 } from './nodes/oscillator/oscillator_node.js'
import { GateSequencer } from './nodes/gate_sequencer/subgraph_sequencer.js'
import { SampleSequencer } from './nodes/sample_sequencer/sample_sequencer_node.js'
import { graphVisualEqualizer } from '../visualizer/global_visualizer.js'
import { NuniRecordingNode } from './nodes/record/record_node.js'
import { NuniGraphAudioNode } from './nodes/module/module_node.js'
import { Envelope } from './envelope/envelope.js'
import { PianoRoll12Tone } from './nodes/pianoroll/pianoroll_12tone_node.js'
import { ProcessorNode } from './nodes/processor/processor_node.js'
import { AutomationNode } from './nodes/automation_node/automation_node.js'



// export type AudioNodeMap = typeof AudioNodeMap
export const AudioNodeMap = 
    { [NodeTypes.GAIN]:       GainNode
    , [NodeTypes.OSC]:        OscillatorNode2
    , [NodeTypes.FILTER]:     BiquadFilterNode
    , [NodeTypes.PANNER]:     StereoPannerNode
    , [NodeTypes.DELAY]:      DelayNode
    , [NodeTypes.SAMPLE]:     NuniSampleNode
    , [NodeTypes.G_SEQ]:        GateSequencer
    , [NodeTypes.S_SEQ]:      SampleSequencer
    , [NodeTypes.NUM]:        ConstantSourceNode
    , [NodeTypes.RECORD]:     NuniRecordingNode
    , [NodeTypes.MODULE]:     NuniGraphAudioNode
    , [NodeTypes.ENV]:        Envelope
    , [NodeTypes.COMPRESSOR]: DynamicsCompressorNode
    , [NodeTypes.PIANOR]:     PianoRoll12Tone
    , [NodeTypes.PROCESSOR]:  ProcessorNode
    , [NodeTypes.AUTO]:       AutomationNode
    } as const
export type AudioNodeMap = typeof AudioNodeMap

type AudioNodeType<T extends NodeTypes> = 
    typeof AudioNodeMap[T]
    
type Osc = AudioNodeType<NodeTypes.OSC>

type OscInstance = InstanceType<Osc>

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

    // private reallyCreateNode<T extends NodeTypes>(type : T) 
    //     : RequiredAudionodeProperties<T> {
    //     return this[createAudioNode[type]]()
    // }

    createNode<T extends NodeTypes>(type : T) {
        // return this[createAudioNode[type]]()
        const node = new (AudioNodeMap[type])(this)

        return node
    }

    createBuffer2() {
        return new NuniSampleNode(this)
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
        return new NuniRecordingNode(this)
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
        return new ProcessorNode(this)
    }

    createAutomationNode() {
        return new AutomationNode(this)
    }
}

export const audioCtx = new AudioContext2()

audioCtx.audioWorklet.addModule('dist/webaudio2/processor/bypass-processor.js')
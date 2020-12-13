






import { BufferNode2 } from './note_in/buffer2.js'
import { OscillatorNode2 } from './note_in/oscillator2.js'
import { GateSequencer } from './sequencers/linear_sequencers/subgraph_sequencer.js'
import { SampleSequencer } from './sequencers/linear_sequencers/buffer_sequencer.js'
import { graphVisualEqualizer } from '../visualizer/global_visualizer.js'
import { AudioBufferCaptureNode } from './record/sample_creator_node.js'
import { NuniGraphAudioNode } from './nunigraph_audionode.js'
import { Envelope } from './envelope/envelope.js'
import { PianoRoll12Tone } from './sequencers/linear_sequencers/pianoroll_12tone.js'
import { ProcessorNode } from './processor/processornode.js'
import { AutomationNode } from './sequencers/automation_node/automation_node.js'



// export type AudioNodeMap = typeof AudioNodeMap
export const AudioNodeMap = 
    { [NodeTypes.GAIN]:       GainNode
    , [NodeTypes.OSC]:        OscillatorNode2
    , [NodeTypes.FILTER]:     BiquadFilterNode
    , [NodeTypes.PANNER]:     StereoPannerNode
    , [NodeTypes.DELAY]:      DelayNode
    , [NodeTypes.SAMPLE]:     BufferNode2
    , [NodeTypes.SGS]:        GateSequencer
    , [NodeTypes.B_SEQ]:      SampleSequencer
    , [NodeTypes.CSN]:        ConstantSourceNode
    , [NodeTypes.RECORD]:     AudioBufferCaptureNode
    , [NodeTypes.MODULE]:     NuniGraphAudioNode
    , [NodeTypes.ENV]:        Envelope
    , [NodeTypes.COMPRESSOR]: DynamicsCompressorNode
    , [NodeTypes.PIANOR]:     PianoRoll12Tone
    , [NodeTypes.PROCESSOR]:  ProcessorNode
    , [NodeTypes.AUTO]:       AutomationNode
    } as const

type AudioNodeType<T extends NodeTypes> = 
    typeof AudioNodeMap[T]
    
type Osc = AudioNodeType<NodeTypes.OSC>

type InstanceType<T extends new (...args: any) => any> = 
    T extends new (...args: any) => infer R ? R : never;

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

    createNode<T extends NodeTypes>(type : T) {
        const createdNode = this[createAudioNode[type]]() as
            ReturnType<this[typeof createAudioNode[T]]>
        return createdNode
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
        return new ProcessorNode(this)
    }

    createAutomationNode() {
        return new AutomationNode(this)
    }
}

export const audioCtx = new AudioContext2()

audioCtx.audioWorklet.addModule('dist/webaudio2/processor/bypass-processor.js')
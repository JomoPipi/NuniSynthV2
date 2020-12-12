






import { Envelope } from '../../webaudio2/envelope/envelope.js'
import 
    { audioCtx, OscillatorNode2 , BufferNode2, GateSequencer
    , SampleSequencer, AudioBufferCaptureNode, NuniGraphAudioNode
    , PianoRoll12Tone, Sequencer, AutomationNode
    } from '../../webaudio2/internal.js'

type AudioNodeMap = {
    [NodeTypes.GAIN]:   GainNode
    [NodeTypes.OSC]:    OscillatorNode2
    [NodeTypes.FILTER]: BiquadFilterNode
    [NodeTypes.PANNER]: StereoPannerNode
    [NodeTypes.DELAY]:  DelayNode
    [NodeTypes.SAMPLE]: BufferNode2
    [NodeTypes.SGS]:    GateSequencer
    [NodeTypes.B_SEQ]:  SampleSequencer
    [NodeTypes.CSN]:    ConstantSourceNode
    [NodeTypes.RECORD]: AudioBufferCaptureNode
    [NodeTypes.MODULE]: NuniGraphAudioNode
    [NodeTypes.AUTO]:   AutomationNode

    [NodeTypes.PIANOR]: PianoRoll12Tone
    [NodeTypes.ENV]:    Envelope
    // [NodeTypes.CUSTOM]: never
    [NodeTypes.PROCESSOR]: AudioWorkletNode
    [NodeTypes.COMPRESSOR]: DynamicsCompressorNode
}

type AudioNode2<T extends NodeTypes> 
    = AudioNodeMap[T] 
    & { [key in AudioParams] : AudioParam }

const is
    = <T extends NodeTypes>(node : NuniGraphNode, type : T)
    : node is NuniGraphNode<T> => node.type === type
    
export class NuniGraphNode<T extends NodeTypes = NodeTypes> {

    readonly id : number
    readonly type : T
    readonly audioNode : AudioNode2<T> // & RequiredAudionodeProperties<T>
    x : number
    y : number
    audioParamValues : Indexable<number>
    title? : string
    graphLabel : string | number
    readonly INPUT_NODE_ID? : { id : number }

    
    constructor(id : number, type : T, settings : NodeCreationSettings) {

        // Change display: {x,y} to just x,y later to save space on the string conversions
        // (will require changing/throwing away all currently saved graphs :/)
        const 
            { x
            , y
            , audioParamValues
            , audioNodeProperties
            , title
            , INPUT_NODE_ID
            } = settings

        this.id = id
        this.type = type
        this.x = x
        this.y = y
        this.title = title
        this.INPUT_NODE_ID = INPUT_NODE_ID

        this.audioNode = new (audioCtx.createNode(type))(audioCtx) as AudioNode2<T>
        this.graphLabel = NodeTypeGraphIcon[type]
        
        // TODO: Maybe start it on tempo tick?
        if (MustBeStarted[type]) (this.audioNode as any).start(0)

        if (this.type !== NodeTypes.COMPRESSOR)
        {
        // CompressorNode throws error
            Object.assign(this.audioNode, JSON.parse(JSON.stringify(audioNodeProperties)))
            
            // ! PAINFUL BUG FIX >:(
            // Fixing bug: Sequencer channelVolume doesn't get copied over because it's a gain node.
            // requestAnimationFrame is needed because GateSequencer's input(s) need to be remmapped..
            // TODO: put this in a function: audioNode.doBadCode()
            requestAnimationFrame(() => {
                if (is(this, NodeTypes.B_SEQ) || is(this, NodeTypes.SGS))
                {
                    if (is(this, NodeTypes.B_SEQ)) 
                    { // This fixed a bug:
                        this.audioNode.channelVolumes = {}
                    }
                    const { channelVolumes, channelData } = this.audioNode
                    for (const key in channelData)
                    {
                        if (!channelVolumes[key])
                        {
                            if (is(this, NodeTypes.SGS)) throw 'Oh, okay. Do it for SGS as well.'
                            this.audioNode.createChannelVolume(+key)
                        }
                        channelVolumes[key].gain.value = channelData[key].volume
                    }
                    this.audioNode.refresh()
                    this.audioNode.hasDoneTheDirtyWork = true
                }
            })
        }

        this.audioParamValues = JSON.parse(JSON.stringify(audioParamValues))

        for (const param of AudioNodeParams[type]) 
        {
            const value
                =  audioParamValues[param] 
                ?? DefaultParamValues[param]
            this.setValueOfParam(param, value)
        }
    }

    setValueOfParam(param : AudioParams, value: number) {
        this.audioParamValues[param] = value
        this.audioNode[param].value = value
    }
}
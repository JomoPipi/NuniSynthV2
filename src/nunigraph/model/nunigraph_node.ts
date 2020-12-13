






import { Envelope } from '../../webaudio2/envelope/envelope.js'
import 
    { audioCtx, OscillatorNode2 , NuniSampleNode, GateSequencer
    , SampleSequencer, NuniRecordingNode, NuniGraphAudioNode
    , PianoRoll12Tone, Sequencer, AutomationNode, AudioNodeMap
    } from '../../webaudio2/internal.js'

// const AudioNodeMap =
//     { [NodeTypes.GAIN]:   GainNode
//     , [NodeTypes.OSC]:    OscillatorNode2
//     , [NodeTypes.FILTER]: BiquadFilterNode
//     , [NodeTypes.PANNER]: StereoPannerNode
//     , [NodeTypes.DELAY]:  DelayNode
//     , [NodeTypes.SAMPLE]: NuniSampleNode
//     , [NodeTypes.G_SEQ]:    GateSequencer
//     , [NodeTypes.S_SEQ]:  SampleSequencer
//     , [NodeTypes.NUM]:    ConstantSourceNode
//     , [NodeTypes.RECORD]: NuniRecordingNode
//     , [NodeTypes.MODULE]: NuniGraphAudioNode
//     , [NodeTypes.AUTO]:   AutomationNode

//     , [NodeTypes.PIANOR]: PianoRoll12Tone
//     , [NodeTypes.ENV]:    Envelope
//     // , [NodeTypes.CUSTOM]: never
//     , [NodeTypes.PROCESSOR]: AudioWorkletNode
//     , [NodeTypes.COMPRESSOR]: DynamicsCompressorNode
//     } as const

type A = AudioNodeParams[NodeTypes.OSC][number]

type AudioNodeParams = typeof AudioNodeParams
// type ParamsOf<T extends NodeTypes> = AudioNodeParams[T][number]
type OscParams = ParamsOf<NodeTypes.OSC>
type T = ParamsOf<NodeTypes>
// type InstanceType<T extends new (...args: any) => any> = 
//     T extends new (...args: any) => infer R ? R : never;

// type AudioNode2<T extends NodeTypes> 
//     = InstanceType<typeof AudioNodeMap[T]>
    // & { [key in ParamsOf<T>] : AudioParam }
    // & { [key in AudioParams] : AudioParam }

const is
    = <T extends NodeTypes>(node : NuniGraphNode, type : T)
    : node is NuniGraphNode<T> => node.type === type

// type NuniAudioNode<T extends NodeTypes> =
//     AudioNode2<T> // & BaseRequiredProperties // RequiredAudionodeProperties<T>



export class NuniGraphNode<T extends NodeTypes = NodeTypes> {

    readonly id : number
    readonly type : T // TODO
    readonly audioNode : 
        & InstanceType<AudioNodeMap[T]>
        // & ReturnType<typeof audioCtx[typeof createAudioNode[T]]>
        // & { [key in ParamsOf<T>] : AudioParam }
        // & { [key in AudioParams] : AudioParam }
        & AudioNodeInterfaces<T>
        
        // NuniAudioNode<T>
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

        type F = InstanceType<typeof AudioNodeMap[NodeTypes.OSC]>
        const an 
            // : ReturnType<typeof audioCtx[typeof createAudioNode[T]]>
            // & RequiredAudionodeProperties<T>
        = audioCtx.createNode<T>(type) as 
            & InstanceType<typeof AudioNodeMap[T]>
            // & ReturnType<typeof audioCtx[typeof createAudioNode[T]]>
            & AudioNodeInterfaces<T>

        this.audioNode = an

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
                if (is(this, NodeTypes.S_SEQ) || is(this, NodeTypes.G_SEQ))
                {
                    if (is(this, NodeTypes.S_SEQ))
                    { // This fixed a bug:
                        this.audioNode.channelVolumes = {}
                    }
                    const { channelVolumes, channelData } = this.audioNode
                    for (const key in channelData)
                    {
                        if (!channelVolumes[key])
                        {
                            if (is(this, NodeTypes.G_SEQ)) throw 'Oh, okay. Do it for SGS as well.'
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

    setValueOfParam(param : ParamsOf<T>, value: number) {
        this.audioParamValues[param] = value
        this.audioNode[param].value = value
    }
}
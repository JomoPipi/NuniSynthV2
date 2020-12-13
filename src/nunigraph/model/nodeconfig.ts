






const enum NodeTypes
{
    GAIN = 'gain',
    OSC = 'oscillator',
    FILTER = 'filter',
    PANNER = 'panner',
    DELAY = 'delay',
    SAMPLE = 'buffer',
    SGS = 'subgraph-sequencer',
    B_SEQ = 'buffer-sequencer',
    CSN = 'constant-source',
    RECORD = 'audio-capture',
    MODULE = 'module',
    AUTO = 'automation',

    PIANOR = 'piano-roll',
    ENV = 'envelope', // <- Not used
    // CUSTOM = 'custom-module',
    PROCESSOR = 'processor',
    COMPRESSOR = 'compression'
}

type AudioParams 
    = 'gain' 
    | 'frequency' 
    | 'detune' 
    | 'pan' 
    | 'Q' 
    | 'delayTime' 
    | 'playbackRate'
    | 'offset'

// compressor node properties:
    | 'threshold'
    | 'knee'
    | 'ratio'
    | 'attack'
    | 'release'

type ConnectionType = 
    AudioParams | 'channel'

type ConnecteeDatum = 
    { id : number, connectionType : ConnectionType }
    
type ConnecteeData = ConnecteeDatum[]

const NodeLabel : { readonly [key in NodeTypes] : string } =  
    { [NodeTypes.GAIN]:   'Gain'
    , [NodeTypes.OSC]:    'Oscillator'
    , [NodeTypes.FILTER]: 'Filter'
    , [NodeTypes.PANNER]: 'Panner'
    , [NodeTypes.DELAY]:  'Delay'
    , [NodeTypes.SAMPLE]: 'Sample'
    , [NodeTypes.SGS]:    'Gate Sequencer'
    , [NodeTypes.B_SEQ]:  'Sample Sequencer'
    , [NodeTypes.CSN]:    'Number Value'
    , [NodeTypes.RECORD]: 'Recorder'
    , [NodeTypes.MODULE]: 'Module'
    , [NodeTypes.AUTO]:   'Automation'
    
    , [NodeTypes.PIANOR]: '12-Tone Piano Roll'
    , [NodeTypes.ENV]:    'Envelope (doesn\'t do anything)'
    // , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]: 'Processor'
    , [NodeTypes.COMPRESSOR]: 'Compression'
    }

const NodeTypeEmojiLabel : { readonly [key in NodeTypes] : string } =  
    { [NodeTypes.GAIN]:   '🔊'
    , [NodeTypes.OSC]:    '∿'
    , [NodeTypes.FILTER]: '🌫️'
    , [NodeTypes.PANNER]: '⧟'
    , [NodeTypes.DELAY]:  '🕖'
    , [NodeTypes.SAMPLE]: '📀'
    , [NodeTypes.SGS]:    '⛩️'
    , [NodeTypes.B_SEQ]:  '📼'
    , [NodeTypes.CSN]:    '🎚️'
    , [NodeTypes.RECORD]: '🎙️'
    , [NodeTypes.MODULE]: '🎛️'
    , [NodeTypes.AUTO]:   '🤖'
    
    , [NodeTypes.PIANOR]: '🎼 '
    , [NodeTypes.ENV]:    'Envelope (doesn\'t do anything)'
    // , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]: '💻'
    , [NodeTypes.COMPRESSOR]: '💢'
    } as const

type GraphIcon = string // The possible URLs will be Enumed'

const GraphIconUrls = 
    [ 'sine'
    , 'triangle'
    , 'square'
    , 'sawtooth'
    , 'custom'
    ] as const

const GraphIconImageObjects =
    GraphIconUrls.reduce((acc, name) => {
        const url = `images/${name}.svg`
        const img = new Image()
        img.src = url
        acc[name] = img
        return acc
    }, {} as Record<string, HTMLImageElement>)

const HasSVGGraphIcon = {
    [NodeTypes.OSC]: true
} as const

type HasSVGGraphIcon = keyof typeof HasSVGGraphIcon

const NodeTypeGraphIcon : { readonly [key in NodeTypes] : GraphIcon } =
    { [NodeTypes.GAIN]:   '🔊'
    , [NodeTypes.OSC]:    '∿'
    , [NodeTypes.FILTER]: '🌫️'
    , [NodeTypes.PANNER]: '⧟'
    , [NodeTypes.DELAY]:  '🕖'
    , [NodeTypes.SAMPLE]: '📀'
    , [NodeTypes.SGS]:    '⛩️'
    , [NodeTypes.B_SEQ]:  '📼'
    , [NodeTypes.CSN]:    '🎚️'
    , [NodeTypes.RECORD]: '🎙️'
    , [NodeTypes.MODULE]: '🎛️'
    , [NodeTypes.AUTO]:   '🤖'
    
    , [NodeTypes.PIANOR]: '🎼 '
    , [NodeTypes.ENV]:    'Envelope (doesn\'t do anything)'
    // , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]: '💻'
    , [NodeTypes.COMPRESSOR]: '💢'
    }

const createAudioNode =
    { [NodeTypes.GAIN]:   'createGain'
    , [NodeTypes.OSC]:    'createOscillator2'
    , [NodeTypes.FILTER]: 'createBiquadFilter'
    , [NodeTypes.PANNER]: 'createStereoPanner'
    , [NodeTypes.DELAY]:  'createDelay'
    , [NodeTypes.SAMPLE]: 'createBuffer2'
    , [NodeTypes.SGS]:    'createGateSequencer'
    , [NodeTypes.B_SEQ]:  'createSampleSequencer'
    , [NodeTypes.CSN]:    'createConstantSource'
    , [NodeTypes.RECORD]: 'createAudioBufferCaptureNode'
    , [NodeTypes.MODULE]: 'createNuniGraphAudioNode'
    , [NodeTypes.AUTO]:   'createAutomationNode'
    
    , [NodeTypes.PIANOR]: 'create12TonePianoRoll'
    , [NodeTypes.ENV]:    'createEnvelopeNode'
    // , [NodeTypes.CUSTOM]: 'createCustomNode'
    , [NodeTypes.PROCESSOR]: 'createProcessorNode'
    , [NodeTypes.COMPRESSOR]: 'createDynamicsCompressor'
    } as const

const SupportsInputChannels : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: true
    , [NodeTypes.AUTO]:   true
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    true
    // , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:true
    , [NodeTypes.COMPRESSOR]:true
    }

const IsAwareOfInputIDs : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: true
    , [NodeTypes.AUTO]:   false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const MustBeStarted : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    true
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false
    , [NodeTypes.AUTO]:   false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const HasAudioParams =
    { [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.SAMPLE]: true
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    true
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false
    , [NodeTypes.AUTO]:   false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:true
    } as const

const HasNoOutput : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: false
    , [NodeTypes.AUTO]:   false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const OpensDialogBoxWhenConnectedTo : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: true
    , [NodeTypes.AUTO]:   false

    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

// The ones that are `false` let you delete stuff inside the node. 
// We don't want the node itself to get deleted.
const SelectWhenDialogBoxIsClicked  : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.SAMPLE]: true
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  true
    , [NodeTypes.CSN]:    true
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: false
    , [NodeTypes.AUTO]:   true

    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    true
    // , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:true
    }

// Goal: convert this to IsNativeAudioNode
const UsesConnectionProtocol2  : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false
    , [NodeTypes.AUTO]:   true

    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }
    
const ClockDependent =
    { [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  true
    , [NodeTypes.AUTO]:   true

    , [NodeTypes.PIANOR]: true
    } as const
type ClockDependent = keyof typeof ClockDependent



const HasResizeableNodeWindow  : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false // true
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false // true
    , [NodeTypes.AUTO]:   false // true

    , [NodeTypes.PIANOR]: false // true
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:false //true
    , [NodeTypes.COMPRESSOR]:false
    }

const AudioNodeParams =
    { [NodeTypes.GAIN]:   ['gain']
    , [NodeTypes.OSC]:    ['frequency','detune']
    , [NodeTypes.FILTER]: ['frequency','Q','gain','detune']
    , [NodeTypes.PANNER]: ['pan']
    , [NodeTypes.DELAY]:  ['delayTime']
    , [NodeTypes.SAMPLE]: ['playbackRate','detune']
    , [NodeTypes.SGS]:    []
    , [NodeTypes.B_SEQ]:  ['playbackRate','detune']
    , [NodeTypes.CSN]:    ['offset']
    , [NodeTypes.RECORD]: []
    , [NodeTypes.MODULE]: []
    , [NodeTypes.AUTO]:   []
    
    , [NodeTypes.PIANOR]: [] // TODO: add offset
    , [NodeTypes.ENV]:    []
    // , get [NodeTypes.CUSTOM]() { return [] }
    // , set [NodeTypes.CUSTOM](params : []) { }
    , [NodeTypes.PROCESSOR]:[]
    , [NodeTypes.COMPRESSOR]: ['threshold', 'knee', 'ratio', 'attack', 'release']
    } as const

const AudioNodeSubTypes : Record<NodeTypes,readonly string[]> =
    { [NodeTypes.GAIN]:   []
    , [NodeTypes.OSC]:    ['sine','triangle','square','sawtooth','custom']
    , [NodeTypes.FILTER]: 
        ["lowpass", "highpass", "bandpass", "lowshelf"
        ,"highshelf", "peaking", "notch", "allpass"]
    , [NodeTypes.PANNER]: []
    , [NodeTypes.DELAY]:  []
    , [NodeTypes.SAMPLE]: []
    , [NodeTypes.SGS]:    []
    , [NodeTypes.B_SEQ]:  []
    , [NodeTypes.CSN]:    []
    , [NodeTypes.RECORD]: []
    , [NodeTypes.MODULE]: []
    , [NodeTypes.AUTO]:   []

    , [NodeTypes.PIANOR]: []
    , [NodeTypes.ENV]:    []
    // , [NodeTypes.CUSTOM]: []
    , [NodeTypes.PROCESSOR]:[]
    , [NodeTypes.COMPRESSOR]:[]
    } as const

const HasSubtypes =
    { [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    } as const
type HasSubtypes = keyof typeof HasSubtypes


const MasterGainColor = '#555'
const NodeTypeColors : { readonly [key in NodeTypes] : string } = 
    { [NodeTypes.GAIN]:   'rgba(255,0,0,0.5)'
    , [NodeTypes.OSC]:    'rgba(0,0,255,0.55)'
    , [NodeTypes.FILTER]: 'rgba(0,255,0,0.5)'
    , [NodeTypes.PANNER]: 'rgba(255,128,0,0.5)'
    , [NodeTypes.DELAY]:  'rgba(255,255,0,0.5)'
    , [NodeTypes.SAMPLE]: 'rgba(0,255,255,0.5)'
    , [NodeTypes.SGS]:    'rgba(255,0,255,0.5)'
    , [NodeTypes.B_SEQ]:  'rgba(0,255,195,0.5)'
    , [NodeTypes.CSN]:    'rgba(255,200,200,0.5)'
    , [NodeTypes.RECORD]: 'rgba(220,150,220,1)'
    , [NodeTypes.MODULE]: 'rgba(255,240,255,0.5)'
    , [NodeTypes.AUTO]:   'rgba(150,255,0,0.5)'
    
    , [NodeTypes.PIANOR]: 'rgba(105,100,255,0.5)'
    , [NodeTypes.ENV]:    'rgba(105,255,255,0.5)'
    // , [NodeTypes.CUSTOM]: 'rgba(105,255,255,0.5)'
    , [NodeTypes.PROCESSOR]:'rgba(200,150,255,0.5)'
    , [NodeTypes.COMPRESSOR]:'rgba(200,180,220,0.5)'
    }

const NodeTypeColors2 : { readonly [key in NodeTypes] : string } = 
    { [NodeTypes.GAIN]:   'rgb(255,0,0)'
    , [NodeTypes.OSC]:    'rgb(0,0,255)'
    , [NodeTypes.FILTER]: 'rgb(0,255,0)'
    , [NodeTypes.PANNER]: 'rgb(255,128,0)'
    , [NodeTypes.DELAY]:  'rgb(255,255,0)'
    , [NodeTypes.SAMPLE]: 'rgb(0,255,255)'
    , [NodeTypes.SGS]:    'rgb(255,0,255)'
    , [NodeTypes.B_SEQ]:  'rgb(0,255,195)'
    , [NodeTypes.CSN]:    'rgb(255,200,200)'
    , [NodeTypes.RECORD]: 'rgb(220,150,220)'
    , [NodeTypes.MODULE]: 'rgb(255,240,255)'
    , [NodeTypes.AUTO]:   'rgb(150,255,0)'
    
    , [NodeTypes.PIANOR]: 'rgb(105,100,255)'
    , [NodeTypes.ENV]:    'rgb(105,100,255)'
    // , [NodeTypes.CUSTOM]: 'rgb(105,255,255)'
    , [NodeTypes.PROCESSOR]:'rgb(200,150,255)'
    , [NodeTypes.COMPRESSOR]:'rgb(200,180,220)'
    }

const NodeTypeWarnings : { readonly [key in NodeTypes]? : string } = 
    { [NodeTypes.FILTER]: `Filters may become unstable and we won't do anything about it. If this happens the program will cease to function properly and will need to be re-started.`
    }

const ConnectionTypeColors : { readonly [key in ConnectionType] : string } =
    { channel:      'gray'
    , frequency:    'rgb(50, 50, 255)'
    , gain:         'red'
    , detune:       'green'
    , Q:            'violet'
    , pan:          'orange'
    , delayTime:    'yellow'
    , playbackRate: 'cyan'
    , offset:       'rgb(255,200,200)'

    , threshold: 'rgb(200,150,150)'
    , knee: 'rgb(200,150,150)'
    , ratio: 'rgb(200,150,150)'
    , attack: 'rgb(200,150,150)'
    , release: 'rgb(200,150,150)'
    }

const DefaultParamValues : { readonly [key in AudioParams] : number } = 
    { gain:         1
    , frequency:    440
    , detune:       0
    , Q:            1
    , pan:          0
    , delayTime:    0.5
    , playbackRate: 1
    , offset:       0
    
    , threshold: 0
    , knee: 0
    , ratio: 1
    , attack: 0.1
    , release: 0.1
    }

const AudioParamRanges : { readonly [key in AudioParams] : [number,number] } = 
    { gain:         [0, 24000]
    , frequency:    [0, 24000]
    , detune:       [-153600, 153600]
    , Q:            [0 ,20]
    , pan:          [-1.0, 1.0]
    , delayTime:    [0, 1]
    , playbackRate: [0, 32]
    , offset:       [-1e5, 1e5]

    , threshold: [-100, 0]
    , knee: [0, 40]
    , ratio: [1, 20]
    , attack: [0, 1]
    , release: [0, 1]
    }

const hasLinearSlider : { readonly [key in AudioParams] : boolean } = 
    { gain:         false
    , frequency:    false
    , detune:       true
    , Q:            true
    , pan:          true
    , delayTime:    false
    , playbackRate: false
    , offset:       false

    , threshold: true
    , knee: true
    , ratio: true
    , attack: false
    , release: false
    }

type SliderType = 'linear' | 'exponential' 
// const AudioParamSliderType : { readonly [key in AudioParams] : SliderType } = 
//     { gain:         false
//     , frequency:    false
//     , detune:       true
//     , Q:            true
//     , pan:          true
//     , delayTime:    false
//     , playbackRate: false
//     , offset:       false

//     , threshold: true
//     , knee: true
//     , ratio: true
//     , attack: false
//     , release: false
//     }

const isSubdividable : { readonly [key in AudioParams] : boolean } = 
    { gain:         false
    , frequency:    true
    , detune:       false
    , Q:            false
    , pan:          false
    , delayTime:    true
    , playbackRate: false
    , offset:       false
    
    , threshold: false
    , knee: false
    , ratio: false
    , attack: false
    , release: false
    }

const AudioParamKnobTurns : { readonly [key in AudioParams] : number } = 
    { gain:         2
    , frequency:    1
    , detune:       128
    , Q:            1
    , pan:          1
    , delayTime:    1
    , playbackRate: 2
    , offset:       8

    , threshold: 1
    , knee: 1
    , ratio: 1
    , attack: 1
    , release: 1
    }

const AudioParamSliderFactor : { readonly [key in AudioParams] : number } = 
    { gain:         2**-8
    , frequency:    2**-6
    , detune:       1
    , Q:            .05
    , pan:          .005
    , delayTime:    2**-11
    , playbackRate: 2**-10
    , offset:       2**-8

    , threshold: 10**-1.5
    , knee: 10**-1.5
    , ratio: 10**-2
    , attack: 2**-9
    , release: 2**-9
    }

interface CustomAudioNodeProperties
{
// Is this interface useless?
// It only throws errors if stepMatrix isn't there.

    kbMode?      : boolean
    type?        : string
    subdiv?      : number
    bufferKey?   : number
    nSteps?      : number
    adsrIndex?   : number
    graphCode?   : string
    stepMatrix?  : Indexable<boolean>
    phaseShift?  : number
    MMLString?   : string
}

const Transferable_Pianoroll_properties = 
    { width       : true
    , height      : true
    , xrange      : true
    , yrange      : true
    , xoffset     : true
    , yoffset     : true
    , xruler      : true
    , yruler      : true
    , markstart   : true
    , markend     : true
    } as const

const Transferable_AudioNodeProperties =
    { type        : true
    , kbMode      : true
    , subdiv      : true
    , bufferKey   : true
    , nSteps      : true
    , adsrIndex   : true
    , graphCode   : true
    , localADSR   : true
    , stepMatrix  : true
    , phaseShift  : true
    , channelData : true
    , MMLString   : true
    , loopStart   : true
    , loopEnd     : true
    , processorCode : true
    , points      : true
    , nMeasures   : true
    
    , threshold: true
    , knee: true
    , ratio: true
    , attack: true
    , release: true
    , ...Transferable_Pianoroll_properties
    } as const

const PostConnection_Transferable_InputRemappable_AudioNodeProperties = 
    { [NodeTypes.SGS]: ['stepMatrix', 'channelData']
    } as const
    
type NodeCreationSettings = { 
    x : number
    y : number
    audioParamValues : Indexable<number>   // Uses draggable number inputs
    audioNodeProperties : CustomAudioNodeProperties
    title? : string
    INPUT_NODE_ID? : { id : number }
}

const TransferableNodeProperties = 
    'id,type,x,y,audioParamValues,audioNodeProperties,title,INPUT_NODE_ID'
    .split(',')
    .reduce((acc,prop) => 
        ({ ...acc, [prop]: true })
    , {} as Indexed)

type BaseRequiredProperties = {
    connect(input : AudioNode | AudioParam) : void
    disconnect(input? : AudioNode | AudioParam) : void

    [others : string]: any
}

type RequiredAudionodeProperties<T extends NodeTypes> = 
    & BaseRequiredProperties
    // & (T extends ClockDependent
    //     ? { scheduleNotes : () => void }
    //     : unknown)
    // & (T extends HasSVGGraphIcon
    //     ? { SVGIconName: typeof GraphIconUrls[number] }
    //     : unknown)


// = {
    // connect : typeof AudioNode.prototype.connect
    // poop : any
    // sync : T extends NodeTypes.B_SEQ ? () => void : any
    // SVGIconName : T extends HasSVGGraphIcon ? typeof GraphIconUrls[number] : undefined

    // scheduleNotes : T extends ClockDependent ? () => void : undefined
    // setTempo : T extends ClockDependent ? (tempo : number) => void : undefined
    // sync : T extends ClockDependent ? () => void : undefined

    // type : T extends HasSubtypes ? typeof AudioNodeSubTypes[T] : undefined
    // poop : T extends HasSubtypes ? typeof AudioNodeSubTypes[T] : undefined
// }
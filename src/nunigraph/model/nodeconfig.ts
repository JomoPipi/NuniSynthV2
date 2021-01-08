






const enum NodeTypes
{ //! DON'T CHANGE STRING VALUES //!
    OUTPUT = 'output',
    GAIN = 'gain',
    OSC = 'oscillator',
    FILTER = 'filter',
    PANNER = 'panner',
    DELAY = 'delay',
    SAMPLE = 'buffer',
    G_SEQ = 'subgraph-sequencer',
    S_SEQ = 'buffer-sequencer',
    NUM = 'constant-source',
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
    { [NodeTypes.OUTPUT]: 'not used'
    , [NodeTypes.GAIN]:   'Gain'
    , [NodeTypes.OSC]:    'Oscillator'
    , [NodeTypes.FILTER]: 'Filter'
    , [NodeTypes.PANNER]: 'Panner'
    , [NodeTypes.DELAY]:  'Delay'
    , [NodeTypes.SAMPLE]: 'Sample'
    , [NodeTypes.G_SEQ]:  'Gate Sequencer'
    , [NodeTypes.S_SEQ]:  'Sample Sequencer'
    , [NodeTypes.NUM]:    'Number Value'
    , [NodeTypes.RECORD]: 'Recorder'
    , [NodeTypes.MODULE]: 'Module'
    , [NodeTypes.AUTO]:   'Automation'
    
    , [NodeTypes.PIANOR]: '12-Tone Piano Roll'
    , [NodeTypes.ENV]:    'Envelope (doesn\'t do anything)'
    // , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]:  'Processor'
    , [NodeTypes.COMPRESSOR]: 'Compression'
    }

type GraphIcon = string // typeof GraphIconUrls[number]
const GraphIconKeys = 
    [ 'sine'
    , 'triangle'
    , 'square'
    , 'sawtooth'
    , 'custom'
    , 'frying-pan'
    , 'volume'
    , 'knob'
    , 'lowpass'
    , 'highpass'
    , 'bandpass'
    , 'notch'
    , 'allpass'
    , 'flask'
    , 'automation'
    , 'stereo'
    , 'fence'
    , 'clock'
    , 'keyboard'
    , 'processor'
    , 'lunar-module'
    , 'compress'
    , 'microphone'
    , 'loud-speaker'
    ] as const
type SVGIconKey = typeof GraphIconKeys[number]

const DefaultNodeIcon : ReadonlyRecord<NodeTypes, SVGIconKey> =
    { [NodeTypes.OUTPUT]: 'loud-speaker'
    , [NodeTypes.GAIN]:   'volume'
    , [NodeTypes.OSC]:    'sine'
    , [NodeTypes.FILTER]: 'lowpass'
    , [NodeTypes.PANNER]: 'frying-pan'
    , [NodeTypes.DELAY]:  'clock'
    , [NodeTypes.SAMPLE]: 'flask'
    , [NodeTypes.G_SEQ]:  'fence'
    , [NodeTypes.S_SEQ]:  'stereo'
    , [NodeTypes.NUM]:    'knob'
    , [NodeTypes.RECORD]: 'microphone'
    , [NodeTypes.MODULE]: 'lunar-module'
    , [NodeTypes.AUTO]:   'automation'
    
    , [NodeTypes.PIANOR]: 'keyboard'
    , [NodeTypes.ENV]:    'knob'
    // , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]: 'processor'
    , [NodeTypes.COMPRESSOR]: 'compress'
    } as const

const HasDynamicNodeIcon = 
    { [NodeTypes.OSC]: true
    , [NodeTypes.FILTER]: true
    }
type HasDynamicNodeIcon = keyof typeof HasDynamicNodeIcon

const GraphIconImageObjects =
    GraphIconKeys.reduce((acc, name) => {
        const url = `images/${name}.svg`
        const img = new Image()
        img.src = url
        acc[name] = img
        return acc
    }, {} as Record<SVGIconKey, HTMLImageElement>)

const KnowsWhenDialogBoxCloses =
    { [NodeTypes.G_SEQ]: true
    , [NodeTypes.S_SEQ]: true
    , [NodeTypes.AUTO]: true
    , [NodeTypes.MODULE]: true
    // TODO: make these true
    // , [NodeTypes.PIANOR]: true
    // , [NodeTypes.PROCESSOR]: true
    }
type KnowsWhenDialogBoxCloses = keyof typeof KnowsWhenDialogBoxCloses

const HasTitleEditor : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.OUTPUT]: false
    , [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: true
    , [NodeTypes.G_SEQ]:  true
    , [NodeTypes.S_SEQ]:  true
    , [NodeTypes.NUM]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: true
    , [NodeTypes.AUTO]:   true
    , [NodeTypes.PIANOR]: true
    , [NodeTypes.ENV]:false
    , [NodeTypes.PROCESSOR]:true
    , [NodeTypes.COMPRESSOR]:true
    }

const SupportsInputChannels : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.OUTPUT]: true
    , [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.G_SEQ]:  true
    , [NodeTypes.S_SEQ]:  false
    , [NodeTypes.NUM]:    false
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
    { [NodeTypes.OUTPUT]: false
    , [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.G_SEQ]:  true
    , [NodeTypes.S_SEQ]:  false
    , [NodeTypes.NUM]:    false
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: true
    , [NodeTypes.AUTO]:   false
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const ExposesAudioparamsInDialogBox =
    { [NodeTypes.GAIN]:       true
    , [NodeTypes.OSC]:        true
    , [NodeTypes.FILTER]:     true
    , [NodeTypes.PANNER]:     true
    , [NodeTypes.DELAY]:      true
    , [NodeTypes.SAMPLE]:     true
    // , [NodeTypes.NUM]:        true
    , [NodeTypes.COMPRESSOR]: true
    } as const

const HasNoOutput : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.OUTPUT]: true
    , [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.G_SEQ]:  false
    , [NodeTypes.S_SEQ]:  false
    , [NodeTypes.NUM]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: false
    , [NodeTypes.AUTO]:   false
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]: false
    , [NodeTypes.COMPRESSOR]:false
    }

const OpensDialogBoxWhenConnectedTo : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.OUTPUT]: false
    , [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.G_SEQ]:  true
    , [NodeTypes.S_SEQ]:  false
    , [NodeTypes.NUM]:    false
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
    { [NodeTypes.OUTPUT]: true
    , [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.SAMPLE]: true
    , [NodeTypes.G_SEQ]:  true
    , [NodeTypes.S_SEQ]:  true
    , [NodeTypes.NUM]:    true
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
    { [NodeTypes.OUTPUT]: false
    , [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false
    , [NodeTypes.G_SEQ]:  false
    , [NodeTypes.S_SEQ]:  false
    , [NodeTypes.NUM]:    false
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
    { [NodeTypes.G_SEQ]:  true
    , [NodeTypes.S_SEQ]:  true
    , [NodeTypes.AUTO]:   true
    , [NodeTypes.PIANOR]: true
    } as const



const HasResizeableNodeWindow  : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.OUTPUT]: false
    , [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.SAMPLE]: false // true
    , [NodeTypes.G_SEQ]:  false
    , [NodeTypes.S_SEQ]:  false
    , [NodeTypes.NUM]:    false
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false // true
    , [NodeTypes.AUTO]:   false // true
    , [NodeTypes.PIANOR]: false // true
    , [NodeTypes.ENV]:    false
    // , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]: false //true
    , [NodeTypes.COMPRESSOR]:false
    }

const AudioNodeParams =
    { [NodeTypes.OUTPUT]: []
    , [NodeTypes.GAIN]:   ['gain']
    , [NodeTypes.OSC]:    ['frequency','detune']
    , [NodeTypes.FILTER]: ['frequency','Q',/*'gain',*/'detune']
    , [NodeTypes.PANNER]: ['pan']
    , [NodeTypes.DELAY]:  ['delayTime']
    , [NodeTypes.SAMPLE]: ['playbackRate','detune']
    , [NodeTypes.G_SEQ]:  []
    , [NodeTypes.S_SEQ]:  ['playbackRate','detune']
    , [NodeTypes.NUM]:    ['offset']
    , [NodeTypes.RECORD]: []
    , [NodeTypes.MODULE]: []
    , [NodeTypes.AUTO]:   []
    
    , [NodeTypes.PIANOR]: []
    , [NodeTypes.ENV]:    []
    , [NodeTypes.PROCESSOR]: []
    , [NodeTypes.COMPRESSOR]: ['threshold', 'knee', 'ratio', 'attack', 'release']
    } as const

const AudioNodeSubTypes : { readonly [key in NodeTypes] : string[] } =
    { [NodeTypes.OUTPUT]: []
    , [NodeTypes.GAIN]:   []
    , [NodeTypes.OSC]:    ['sine','triangle','square','sawtooth'] // ,'custom'] <- might come back later
    , [NodeTypes.FILTER]:
        ["lowpass", "highpass", "bandpass", /*"lowshelf"
        ,"highshelf", "peaking",*/ "notch", "allpass"]
    , [NodeTypes.PANNER]: []
    , [NodeTypes.DELAY]:  []
    , [NodeTypes.SAMPLE]: []
    , [NodeTypes.G_SEQ]:  []
    , [NodeTypes.S_SEQ]:  []
    , [NodeTypes.NUM]:    []
    , [NodeTypes.RECORD]: []
    , [NodeTypes.MODULE]: []
    , [NodeTypes.AUTO]:   []

    , [NodeTypes.PIANOR]: []
    , [NodeTypes.ENV]:    []
    // , [NodeTypes.CUSTOM]: []
    , [NodeTypes.PROCESSOR]: []
    , [NodeTypes.COMPRESSOR]:[]
    }

const HasSubtypes =
    { [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    } as const
type HasSubtypes = keyof typeof HasSubtypes


const NodeTypeColors : { readonly [key in NodeTypes] : string } = 
    { [NodeTypes.OUTPUT]: 'rgba(128,128,128,0.5)'
    , [NodeTypes.GAIN]:   'rgba(255,0,0,0.5)'
    , [NodeTypes.OSC]:    'rgba(0,0,255,0.55)'
    , [NodeTypes.FILTER]: 'rgba(0,255,0,0.5)'
    , [NodeTypes.PANNER]: 'rgba(255,128,0,0.5)'
    , [NodeTypes.DELAY]:  'rgba(255,255,0,0.5)'
    , [NodeTypes.SAMPLE]: 'rgba(0,255,255,0.5)'
    , [NodeTypes.G_SEQ]:  'rgba(255,0,255,0.5)'
    , [NodeTypes.S_SEQ]:  'rgba(0,255,195,0.5)'
    , [NodeTypes.NUM]:    'rgba(255,200,200,0.5)'
    , [NodeTypes.RECORD]: 'rgba(220,150,220,1)'
    , [NodeTypes.MODULE]: 'rgba(255,240,255,0.5)'
    , [NodeTypes.AUTO]:   'rgba(150,255,0,0.5)'
    
    , [NodeTypes.PIANOR]: 'rgba(105,100,255,0.5)'
    , [NodeTypes.ENV]:    'rgba(105,255,255,0.5)'
    // , [NodeTypes.CUSTOM]: 'rgba(105,255,255,0.5)'
    , [NodeTypes.PROCESSOR]: 'rgba(200,150,255,0.5)'
    , [NodeTypes.COMPRESSOR]:'rgba(200,180,220,0.5)'
    }

const NodeTypeColors2 : { readonly [key in NodeTypes] : string } = 
    { [NodeTypes.OUTPUT]: 'rgb(128,128,128)'
    , [NodeTypes.GAIN]:   'rgb(255,0,0)'
    , [NodeTypes.OSC]:    'rgb(0,0,255)'
    , [NodeTypes.FILTER]: 'rgb(0,255,0)'
    , [NodeTypes.PANNER]: 'rgb(255,128,0)'
    , [NodeTypes.DELAY]:  'rgb(255,255,0)'
    , [NodeTypes.SAMPLE]: 'rgb(0,255,255)'
    , [NodeTypes.G_SEQ]:  'rgb(255,0,255)'
    , [NodeTypes.S_SEQ]:  'rgb(0,255,195)'
    , [NodeTypes.NUM]:    'rgb(255,200,200)'
    , [NodeTypes.RECORD]: 'rgb(220,150,220)'
    , [NodeTypes.MODULE]: 'rgb(255,240,255)'
    , [NodeTypes.AUTO]:   'rgb(150,255,0)'
    
    , [NodeTypes.PIANOR]: 'rgb(105,100,255)'
    , [NodeTypes.ENV]:    'rgb(105,100,255)'
    // , [NodeTypes.CUSTOM]: 'rgb(105,255,255)'
    , [NodeTypes.PROCESSOR]: 'rgb(200,150,255)'
    , [NodeTypes.COMPRESSOR]:'rgb(200,180,220)'
    }

const NodeTypeDescriptions =
    { [NodeTypes.OUTPUT]: 'NOT USED'
    , [NodeTypes.GAIN]:   'Gain nodes increase or decrease the intensity of signals. These should be used frequently.'
    , [NodeTypes.OSC]:    'Oscillator nodes output a basic tone.'
    , [NodeTypes.FILTER]: 'Filter nodes allow you to remove (or filter out) ranges of frequencies.'
    , [NodeTypes.PANNER]: 'Panner nodes pan the sound output left or right.'
    , [NodeTypes.DELAY]:  'Delay nodes cause a delay between the arrival of input data and its\' propagation to the output.'
    , [NodeTypes.SAMPLE]: 'Sample nodes represent a short audio asset residing in memory.'
    , [NodeTypes.G_SEQ]:  'Gate Sequencer nodes output simple rhythmic sequences from their inputs.'
    , [NodeTypes.S_SEQ]:  'Sample Sequencer nodes output simple rhythmic sequences from samples.'
    , [NodeTypes.NUM]:    'It\'s just a number. You can connect it to parameters of other nodes.'
    , [NodeTypes.RECORD]: 'This node records it\'s input(s).'
    , [NodeTypes.MODULE]: 'Module nodes have nodes inside of them.'
    , [NodeTypes.AUTO]:   'Automation nodes automate the input signal.'

    , [NodeTypes.PIANOR]: 'Pianoroll nodes are meant to be connected to the detune parameter of nodes that have a detune parameter (Oscillator, Sample, Sample Sequencer, Filter).'
    , [NodeTypes.ENV]:    'NOT USED'
    , [NodeTypes.PROCESSOR]: 'Processor nodes execute audio processing code.'
    , [NodeTypes.COMPRESSOR]:'Compressor nodes provide a compression effect which lowers the volume of the loudest parts of the signal in order to help prevent clipping and distortion that can occur when multiple sounds are played and multiplexed together at once.'
    } as const

const NodeTypeWarnings : { readonly [key in NodeTypes]? : string } = 
    { [NodeTypes.FILTER]: `Filters may become unstable and we won't do anything about it. If this happens the program will cease to function properly and will need to be re-started.`
    , [NodeTypes.DELAY]: `delayTime does not exceed 1 second.`
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
    stepMatrix?  : Record<string, boolean>
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
    , mutedChannel : true
    , MMLString   : true
    , loopStart   : true
    , loopEnd     : true
    , zoomStart   : true
    , zoomEnd     : true
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
    { [NodeTypes.G_SEQ]: ['stepMatrix', 'channelData', 'mutedChannel']
    } as const
    
type NodeCreationSettings = { 
    x : number
    y : number
    audioParamValues : Record<string, number> // Record<typeof AudioNodeParams[NodeTypes][number], number>
    audioNodeProperties : CustomAudioNodeProperties
    title? : string
    INPUT_NODE_ID? : { id : number }
}

const TransferableNodeProperties = 
    { id: true
    , type: true
    , x: true
    , y: true
    , audioParamValues: true
    , title: true
    , INPUT_NODE_ID: true
    } as const








class NuniAudioParam extends ConstantSourceNode {
    constructor(ctx : AudioContext) {
        super(ctx)
        this.offset.value = 0
        this.start(ctx.currentTime)
    }
    set value(value : number) {
        this.offset.value = value
    }
}

const CanBeAutomated =
    [ NodeTypes.GAIN
    , NodeTypes.OSC
    , NodeTypes.FILTER
    , NodeTypes.PANNER
    , NodeTypes.DELAY
    , NodeTypes.SAMPLE
    , NodeTypes.S_SEQ
    , NodeTypes.NUM
    , NodeTypes.COMPRESSOR
    ] as const
type CanBeAutomated = typeof CanBeAutomated[number]

type ParamsOf<T extends NodeTypes> = T extends CanBeAutomated
    ? typeof AudioNodeParams[T][number]
    : any

interface BaseAudioNodeProperties {
    connect(input : AudioNode | AudioParam) : void
    disconnect(input? : AudioNode | AudioParam) : void
}

type ClockDependent = keyof typeof ClockDependent
type IClockDependent<T> = (T extends ClockDependent
    ? {
        scheduleNotes() : void
        setTempo(tempo : number) : void
        sync() : void
    }
    : {})

type IHasDynamicNodeIcon<T> = (T extends HasDynamicNodeIcon
    ? {
        getNodeIcon() : SVGIconKey
    }
    : {})

type IKnowsWhenDialogBoxCloses<T> = (T extends KnowsWhenDialogBoxCloses
    ? { 
        deactivateWindow() : void
    }
    : {})

type AudioNodeInterfaces<T extends NodeTypes> =
    & BaseAudioNodeProperties
    & IClockDependent<T>
    & IHasDynamicNodeIcon<T>
    & IKnowsWhenDialogBoxCloses<T>



    
const PRODUCTION_MODE_EQUALS_TRUE 
    = true
    
const DEV_MODE_EQUALS_TRUE : typeof PRODUCTION_MODE_EQUALS_TRUE extends true ? false : true 
    = !PRODUCTION_MODE_EQUALS_TRUE
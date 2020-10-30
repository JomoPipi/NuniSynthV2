






enum NodeTypes
{
    GAIN = 'gain',
    OSC = 'oscillator',
    FILTER = 'filter',
    PANNER = 'panner',
    DELAY = 'delay',
    BUFFER = 'buffer',
    SGS = 'subgraph-sequencer',
    B_SEQ = 'buffer-sequencer',
    CSN = 'constant-source',
    RECORD = 'audio-capture',
    MODULE = 'module',

    PIANOR = 'piano-roll',
    ENV = 'envelope', // <- Not used
    CUSTOM = 'custom-module',
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
    , [NodeTypes.BUFFER]: 'Sample'
    , [NodeTypes.SGS]:    'Gate Sequencer'
    , [NodeTypes.B_SEQ]:  'Sample Sequencer'
    , [NodeTypes.CSN]:    'Number Value'
    , [NodeTypes.RECORD]: 'Recorder'
    , [NodeTypes.MODULE]: 'Module'
    
    , [NodeTypes.PIANOR]: '12-Tone Piano Roll'
    , [NodeTypes.ENV]:    'Envelope (doesn\'t do anything)'
    , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]: 'Processor'
    , [NodeTypes.COMPRESSOR]: 'Compression'
    }

const NodeEmojiLabel : { readonly [key in NodeTypes] : string } =  
    { [NodeTypes.GAIN]:   '🔊'
    , [NodeTypes.OSC]:    '∿'
    , [NodeTypes.FILTER]: '🌫️'
    , [NodeTypes.PANNER]: '⧟'
    , [NodeTypes.DELAY]:  '🕖'
    , [NodeTypes.BUFFER]: '📼'
    , [NodeTypes.SGS]:    '⛩️'
    , [NodeTypes.B_SEQ]:  '📼'
    , [NodeTypes.CSN]:    '🎚️'
    , [NodeTypes.RECORD]: '🎙️'
    , [NodeTypes.MODULE]: '🎛️'
    
    , [NodeTypes.PIANOR]: '🎼 '
    , [NodeTypes.ENV]:    'Envelope (doesn\'t do anything)'
    , [NodeTypes.CUSTOM]: 'Custom Module (should be hidden)'
    , [NodeTypes.PROCESSOR]: '💻'
    , [NodeTypes.COMPRESSOR]: '💢'
    }

const createAudioNode : { readonly [key in NodeTypes] : string } =
    { [NodeTypes.GAIN]:   'createGain'
    , [NodeTypes.OSC]:    'createOscillator2'
    , [NodeTypes.FILTER]: 'createBiquadFilter'
    , [NodeTypes.PANNER]: 'createStereoPanner'
    , [NodeTypes.DELAY]:  'createDelay'
    , [NodeTypes.BUFFER]: 'createBuffer2'
    , [NodeTypes.SGS]:    'createGateSequencer'
    , [NodeTypes.B_SEQ]:  'createSampleSequencer'
    , [NodeTypes.CSN]:    'createConstantSource'
    , [NodeTypes.RECORD]: 'createAudioBufferCaptureNode'
    , [NodeTypes.MODULE]: 'createNuniGraphAudioNode'
    
    , [NodeTypes.PIANOR]: 'create12TonePianoRoll'
    , [NodeTypes.ENV]:    'createEnvelopeNode'
    , [NodeTypes.CUSTOM]: 'createCustomNode'
    , [NodeTypes.PROCESSOR]: 'createProcessorNode'
    , [NodeTypes.COMPRESSOR]: 'createCompressorNode'
    }

const SupportsInputChannels : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: true
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    true
    , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:true
    , [NodeTypes.COMPRESSOR]:true
    }

const IsAwareOfInputIDs : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: true
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const MustBeStarted : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    true
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const HasAudioParams : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   true
    , [NodeTypes.OSC]:    true
    , [NodeTypes.FILTER]: true
    , [NodeTypes.PANNER]: true
    , [NodeTypes.DELAY]:  true
    , [NodeTypes.BUFFER]: true
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    true
    , [NodeTypes.RECORD]: false
    , [NodeTypes.MODULE]: false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:true
    }

const HasNoOutput : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]:    false
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: false
    
    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    , [NodeTypes.CUSTOM]: false
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:false
    }

const OpensDialogBoxWhenConnectedTo : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  false
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: true

    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    false
    , [NodeTypes.CUSTOM]: false
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
    , [NodeTypes.BUFFER]: true
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  true
    , [NodeTypes.CSN]:    true
    , [NodeTypes.RECORD]: true
    , [NodeTypes.MODULE]: false

    , [NodeTypes.PIANOR]: false
    , [NodeTypes.ENV]:    true
    , [NodeTypes.CUSTOM]: true
    , [NodeTypes.PROCESSOR]:false
    , [NodeTypes.COMPRESSOR]:true
    }


const AudioNodeParams : Record<NodeTypes,AudioParams[]> =
    { [NodeTypes.GAIN]:   ['gain']
    , [NodeTypes.OSC]:    ['frequency','detune']
    , [NodeTypes.FILTER]: ['frequency','Q','gain','detune']
    , [NodeTypes.PANNER]: ['pan']
    , [NodeTypes.DELAY]:  ['delayTime']
    , [NodeTypes.BUFFER]: ['playbackRate','detune']
    , [NodeTypes.SGS]:    []
    , [NodeTypes.B_SEQ]:  ['playbackRate','detune']
    , [NodeTypes.CSN]:    ['offset']
    , [NodeTypes.RECORD]: []
    , [NodeTypes.MODULE]: []
    
    , [NodeTypes.PIANOR]: [] // TODO: add offset
    , [NodeTypes.ENV]:    []
    , get [NodeTypes.CUSTOM]() { return [] }
    // , set [NodeTypes.CUSTOM](params : []) { }
    , [NodeTypes.PROCESSOR]:[]
    , [NodeTypes.COMPRESSOR]: ['threshold', 'knee', 'ratio', 'attack', 'release']
    }

const AudioNodeSubTypes : { readonly [key in NodeTypes] : string[] } =
    { [NodeTypes.GAIN]:   []
    , [NodeTypes.OSC]:    ['sine','square','triangle','sawtooth','custom']
    , [NodeTypes.FILTER]: 
        ["lowpass", "highpass", "bandpass", "lowshelf"
        ,"highshelf", "peaking", "notch", "allpass"]
    , [NodeTypes.PANNER]: []
    , [NodeTypes.DELAY]:  []
    , [NodeTypes.BUFFER]: []
    , [NodeTypes.SGS]:    []
    , [NodeTypes.B_SEQ]:  []
    , [NodeTypes.CSN]:    []
    , [NodeTypes.RECORD]: []
    , [NodeTypes.MODULE]: []

    , [NodeTypes.PIANOR]: []
    , [NodeTypes.ENV]:    []
    , [NodeTypes.CUSTOM]: []
    , [NodeTypes.PROCESSOR]:[]
    , [NodeTypes.COMPRESSOR]:[]
    }

const MasterGainColor = '#555'
const NodeTypeColors : { readonly [key in NodeTypes] : string } = 
    { [NodeTypes.GAIN]:   'rgba(255,0,0,0.5)'
    , [NodeTypes.OSC]:    'rgba(0,0,255,0.5)'
    , [NodeTypes.FILTER]: 'rgba(0,255,0,0.5)'
    , [NodeTypes.PANNER]: 'rgba(255,128,0,0.5)'
    , [NodeTypes.DELAY]:  'rgba(255,255,0,0.5)'
    , [NodeTypes.BUFFER]: 'rgba(0,255,255,0.5)'
    , [NodeTypes.SGS]:    'rgba(255,0,255,0.5)'
    , [NodeTypes.B_SEQ]:  'rgba(0,255,195,0.5)'
    , [NodeTypes.CSN]:    'rgba(255,200,200,0.5)'
    , [NodeTypes.RECORD]: 'rgba(255,200,255,1)'
    , [NodeTypes.MODULE]: 'rgba(255,240,255,0.5)'
    
    , [NodeTypes.PIANOR]: 'rgba(105,100,255,0.5)'
    , [NodeTypes.ENV]:    'rgba(105,255,255,0.5)'
    , [NodeTypes.CUSTOM]: 'rgba(105,255,255,0.5)'
    , [NodeTypes.PROCESSOR]:'rgba(200,150,255,0.5)'
    , [NodeTypes.COMPRESSOR]:'rgba(200,180,220,0.5)'
    }

const NodeTypeColors2 : { readonly [key in NodeTypes] : string } = 
    { [NodeTypes.GAIN]:   'rgb(255,0,0)'
    , [NodeTypes.OSC]:    'rgb(0,0,255)'
    , [NodeTypes.FILTER]: 'rgb(0,255,0)'
    , [NodeTypes.PANNER]: 'rgb(255,128,0)'
    , [NodeTypes.DELAY]:  'rgb(255,255,0)'
    , [NodeTypes.BUFFER]: 'rgb(0,255,255)'
    , [NodeTypes.SGS]:    'rgb(255,0,255)'
    , [NodeTypes.B_SEQ]:  'rgb(0,255,195)'
    , [NodeTypes.CSN]:    'rgb(255,200,200)'
    , [NodeTypes.RECORD]: 'rgb(255,200,255)'
    , [NodeTypes.MODULE]: 'rgb(255,240,255)'
    
    , [NodeTypes.PIANOR]: 'rgb(105,100,255)'
    , [NodeTypes.ENV]:    'rgb(105,100,255)'
    , [NodeTypes.CUSTOM]: 'rgb(105,255,255)'
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

const sliderFactor : { readonly [key in AudioParams] : number } = 
    { gain:         10**-2
    , frequency:    2**-7
    , detune:       1.0
    , Q:            .05
    , pan:          .005
    , delayTime:    .005
    , playbackRate: 2**-6
    , offset:       10**-2

    , threshold: 10**-2
    , knee: 10**-2
    , ratio: 10**-2
    , attack: 10**-2
    , release: 10**-2
    }

interface CustomAudioNodeProperties
{
// Is this interface useless?
// It only throws errors if stepMatrix isn't there.

    kbMode?      : boolean
    type?        : string
    subdiv?      : number
    isInSync?    : boolean
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
    }

const Transferable_AudioNodeProperties = Object.assign(
    { type        : true
    , kbMode      : true
    , subdiv      : true
    , subdivisionSynced : true
    , isInSync    : true
    , bufferKey   : true
    , nSteps      : true
    , adsrIndex   : true
    , graphCode   : true
    , stepMatrix  : true
    , phaseShift  : true
    , channelData : true
    , MMLString   : true
    , loopStart   : true
    , loopEnd     : true
    
    , threshold: true
    , knee: true
    , ratio: true
    , attack: true
    , release: true
    },
    Transferable_Pianoroll_properties)

const PostConnection_Transferable_InputRemappable_AudioNodeProperties 
: Immutable<{ [key in NodeTypes]? : (keyof typeof Transferable_AudioNodeProperties)[] }> = 

    { [NodeTypes.SGS] : ['stepMatrix', 'channelData'] 
    }
    
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
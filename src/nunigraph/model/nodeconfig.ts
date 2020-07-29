






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
    CUSTOM = 'module'
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

type ConnectionType = 
    AudioParams | 'channel'

type ConnecteeDatum = 
    { id : number, connectionType : ConnectionType }
    
type ConnecteeData = ConnecteeDatum[]



const NodeLabel = 
    { [NodeTypes.GAIN]:   'GAIN'
    , [NodeTypes.OSC]:    'OSCILLATOR'
    , [NodeTypes.FILTER]: 'FILTER'
    , [NodeTypes.PANNER]: 'PANNER'
    , [NodeTypes.DELAY]:  'DELAY'
    , [NodeTypes.BUFFER]: 'BUFFER'
    , [NodeTypes.SGS]:    'SUBGRAPH SEQUENCER'
    , [NodeTypes.B_SEQ]:  'BUFFER SEQUENCER'
    , [NodeTypes.CSN]:    'CONSTANT SOURCE'
    , [NodeTypes.RECORD]: 'AUDIO CAPTURE'
    , [NodeTypes.CUSTOM]: 'MODULE'
}

const createAudioNode =
    { [NodeTypes.GAIN]:   'createGain'
    , [NodeTypes.OSC]:    'createOscillator2'
    , [NodeTypes.FILTER]: 'createBiquadFilter'
    , [NodeTypes.PANNER]: 'createStereoPanner'
    , [NodeTypes.DELAY]:  'createDelay'
    , [NodeTypes.BUFFER]: 'createBuffer2'
    , [NodeTypes.SGS]:    'createSubgraphSequencer'
    , [NodeTypes.B_SEQ]:  'createBufferSequencer'
    , [NodeTypes.CSN]:    'createConstantSource'
    , [NodeTypes.RECORD]: 'createAudioBufferCaptureNode'
    , [NodeTypes.CUSTOM]: 'createCustomNode'
}

const SupportsInputChannels =
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
    , [NodeTypes.CUSTOM]: true
}

const MustBeStarted =
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
    , [NodeTypes.CUSTOM]: false
}

const HasNoAudioParams =
    { [NodeTypes.GAIN]:   false
    , [NodeTypes.OSC]:    false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]:    true
    , [NodeTypes.B_SEQ]:  true
    , [NodeTypes.CSN]:    false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.CUSTOM]: true
}

const HasNoOutput =
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
    , [NodeTypes.CUSTOM]: false
}

const OpensDialogBoxWhenConnectedTo : { readonly [key in NodeTypes] : boolean } =
    { [NodeTypes.GAIN]: false
    , [NodeTypes.OSC]:  false
    , [NodeTypes.FILTER]: false
    , [NodeTypes.PANNER]: false
    , [NodeTypes.DELAY]:  false
    , [NodeTypes.BUFFER]: false
    , [NodeTypes.SGS]: true
    , [NodeTypes.B_SEQ]: false
    , [NodeTypes.CSN]: false
    , [NodeTypes.RECORD]: true
    , [NodeTypes.CUSTOM]: true
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
    , [NodeTypes.CUSTOM]: []
    }

const AudioNodeSubTypes = 
    { [NodeTypes.GAIN]:   []
    , [NodeTypes.OSC]:    ['sine','square','triangle','sawtooth']
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
    , [NodeTypes.CUSTOM]: []
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
    , [NodeTypes.CUSTOM]: 'rgba(255,240,255,0.5)'
    }

const NodeTypeWarnings : { readonly [key in NodeTypes]? : string } = 
    { [NodeTypes.FILTER]: `Filters may become unstable and we won't do anything about it. If this happens the program will cease to function properly and will need to be re-started.`
    }

const ConnectionTypeColors : { readonly [key in ConnectionType] : string } =
    { channel:      'gray'
    , frequency:    'blue'
    , gain:         'red'
    , detune:       'green'
    , Q:            'violet'
    , pan:          'orange'
    , delayTime:    'yellow'
    , playbackRate: 'cyan'
    , offset:       'rgb(255,200,200)'
    }

const DefaultParamValues : { readonly [key in AudioParams] : number } = 
    { gain:         0.5
    , frequency:    440
    , detune:       0
    , Q:            1
    , pan:          0
    , delayTime:    0.5
    , playbackRate: 1
    , offset:       0
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
}

const Transferable_AudioNode_Properties = 
    { type        : true
    , kbMode      : true
    , subdiv      : true
    , isInSync    : true
    , bufferKey   : true
    , nSteps      : true
    , adsrIndex   : true
    , graphCode   : true
    , stepMatrix  : true
    , phaseShift  : true
    , channelData : true
    }

// TODO: get rid of this by refactoring sequencers to compose Sequencer rather than inherit
// only SGS uses this
// const SGS_MustBeKeptOnAudioNodeForCopyingAfterConnectionsAreMade = 
//     'stepMatrix'
//     .split(',')
//     .reduce((a,prop) =>
//         (a[prop] = true, a), <Indexed>{})

const PostConnectionTransferableAudioNodeProperties : { [key in NodeTypes]? : any[] } = 
    { [NodeTypes.SGS] : ['stepMatrix']
    }
    
type NodeCreationSettings = { 
    x : number
    y : number
    audioParamValues : Indexable<number>   // Uses draggable number inputs
    audioNodeProperties : CustomAudioNodeProperties
    title? : string
    INPUT_NODE_ID? : { id : number },
}

const TransferableNodeProperties = 
    'id,type,x,y,audioParamValues,audioNodeProperties,title,INPUT_NODE_ID'
    .split(',')
    .reduce((acc,prop) => 
        ({ ...acc, [prop]: true })
    , {} as Indexed)
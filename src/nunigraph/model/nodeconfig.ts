






enum NodeTypes 
{
    GAIN    = 'gain',
    OSC     = 'oscillator',
    FILTER  = 'filter',
    PANNER  = 'panner',
    DELAY   = 'delay',
    BUFFER  = 'buffer',
    SGS     = 'subgraph-sequencer',
    B_SEQ   = 'buffer-sequencer',
    CSN     = 'constant-source',
    RECORD  = 'audiobuffer-capture',
    CUSTOM  = 'module'
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



const createAudioNode =
{
    [NodeTypes.GAIN]:   'createGain',
    [NodeTypes.OSC]:    'createOscillator2',
    [NodeTypes.FILTER]: 'createBiquadFilter',
    [NodeTypes.PANNER]: 'createStereoPanner',
    [NodeTypes.DELAY]:  'createDelay',
    [NodeTypes.BUFFER]: 'createBuffer2',
    [NodeTypes.SGS]:    'createSubgraphSequencer',
    [NodeTypes.B_SEQ]:  'createBufferSequencer',
    [NodeTypes.CSN]:    'createConstantSource',
    [NodeTypes.RECORD]: 'createAudioBufferCaptureNode',
    [NodeTypes.CUSTOM]: 'createCustomNode'
}

const SupportsInputChannels = {
    [NodeTypes.GAIN]:   true,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: true,
    [NodeTypes.PANNER]: true,
    [NodeTypes.DELAY]:  true,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]:    true,
    [NodeTypes.B_SEQ]:  false,
    [NodeTypes.CSN]:    false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.CUSTOM]: true
}

const MustBeStarted = {
    [NodeTypes.GAIN]:   false,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]:  false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]:    false,
    [NodeTypes.B_SEQ]:  false,
    [NodeTypes.CSN]:    true,
    [NodeTypes.RECORD]: false,
    [NodeTypes.CUSTOM]: false,
}

const HasNoAudioParams = { 
    [NodeTypes.GAIN]:   false,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]:  false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]:    true,
    [NodeTypes.B_SEQ]:  true,
    [NodeTypes.CSN]:    false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.CUSTOM]: true
}

const HasNoOutput = { 
    [NodeTypes.GAIN]:   false,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]:  false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]:    false,
    [NodeTypes.B_SEQ]:  false,
    [NodeTypes.CSN]:    false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.CUSTOM]: false,
}

const AudioNodeParams : Indexable<AudioParams[]> = {
    [NodeTypes.GAIN]:   ['gain'],
    [NodeTypes.OSC]:    ['frequency','detune'],
    [NodeTypes.FILTER]: ['frequency','Q','gain','detune'],
    [NodeTypes.PANNER]: ['pan'],
    [NodeTypes.DELAY]:  ['delayTime'],
    [NodeTypes.BUFFER]: ['playbackRate','detune'],
    [NodeTypes.SGS]:    [],
    [NodeTypes.B_SEQ]:  ['playbackRate','detune'],
    [NodeTypes.CSN]:    ['offset'],
    [NodeTypes.RECORD]: [],
    [NodeTypes.CUSTOM]: [],
}

const AudioNodeSubTypes = {
    [NodeTypes.GAIN]:   [],
    [NodeTypes.OSC]:    ['sine','square','triangle','sawtooth'],
    [NodeTypes.FILTER]: 
        ["lowpass", "highpass", "bandpass", "lowshelf",
         "highshelf", "peaking", "notch", "allpass"],
    [NodeTypes.PANNER]: [],
    [NodeTypes.DELAY]:  [],
    [NodeTypes.BUFFER]: [],
    [NodeTypes.SGS]:    [],
    [NodeTypes.B_SEQ]:  [],
    [NodeTypes.CSN]:    [],
    [NodeTypes.RECORD]: [],
    [NodeTypes.CUSTOM]: [],
}

const MasterGainColor = '#555'
const NodeTypeColors : { readonly [key in NodeTypes] : string } = {
    [NodeTypes.GAIN]:   'rgba(255,0,0,0.5)',
    [NodeTypes.OSC]:    'rgba(0,0,255,0.5)',
    [NodeTypes.FILTER]: 'rgba(0,255,0,0.5)',
    [NodeTypes.PANNER]: 'rgba(255,128,0,0.5)',
    [NodeTypes.DELAY]:  'rgba(255,255,0,0.5)',
    [NodeTypes.BUFFER]: 'rgba(0,255,255,0.5)',
    [NodeTypes.SGS]:    'rgba(255,0,255,0.5)',
    [NodeTypes.B_SEQ]:  'rgba(0,255,195,0.5)',
    [NodeTypes.CSN]:    'rgba(255,200,200,0.5)',
    [NodeTypes.RECORD]: 'rgba(255,255,255,1)',
    [NodeTypes.CUSTOM]: 'rgba(255,200,255,1)'
}

const ConnectionTypeColors : { readonly [key in ConnectionType] : string } =
{
    channel:      'gray',
    frequency:    'blue',
    gain:         'red',
    detune:       'green',
    Q:            'violet',
    pan:          'orange',
    delayTime:    'yellow',
    playbackRate: 'cyan',
    offset:       'rgb(255,200,200)'
}

const DefaultParamValues : { readonly [key in AudioParams] : number } = 
{
    gain:         0.5,
    frequency:    440,
    detune:       0,
    Q:            1,
    pan:          0,
    delayTime:    0.5,
    playbackRate: 1,
    offset:       0,
}

const AudioParamRanges : { readonly [key in AudioParams] : [number,number] } = 
{
    gain:         [0, 24000],
    frequency:    [0, 24000],
    detune:       [-153600, 153600],
    Q:            [0 ,20],
    pan:          [-1.0, 1.0],
    delayTime:    [0, 1],
    playbackRate: [0, 32],
    offset:       [-1e5, 1e5]
}

const hasLinearSlider : { readonly [key in AudioParams] : boolean } = 
{
    gain:         true,
    frequency:    false,
    detune:       true,
    Q:            true,
    pan:          true,
    delayTime:    false,
    playbackRate: false,
    offset:       true
}

const sliderFactor : { readonly [key in AudioParams] : number } = 
{
    gain:         .025,
    frequency:    2**-7,
    detune:       1.0,
    Q:            .05,
    pan:          .005,
    delayTime:    .005,
    playbackRate: 2**-6,
    offset:       2.0
}

type CustomAudioNodeProperties =
{
    kbMode?      : boolean
    type?        : string
    subdiv?      : number
    isInSync?    : boolean
    bufferKey?   : number
    nSteps?      : number
    adsrIndex?   : number
    graphCode?   : string
    title?       : string
    INPUT_NODE_ID? : number
}

const isTransferable =
    'kbMode,type,subdiv,isInSync,bufferKey,nSteps,adsrIndex,graphCode,title,INPUT_NODE_ID'
    .split(',')
    .reduce((acc,prop) => 
        ({ ...acc, [prop]: true })
    , {} as { [key in keyof CustomAudioNodeProperties]: true })
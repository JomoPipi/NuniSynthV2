

enum NodeTypes {
    GAIN = 'gain',
    OSC = 'oscillator',
    FILTER = 'filter',
    PANNER = 'panner',
    DELAY = 'delay'
}

type AudioParamString = 'gain' | 'frequency' | 'detune' | 'pan' | 'Q' | 'delayTime'
type ConnectionType = AudioParamString | 'channel'
type ConnecteeDatum = { id : number, connectionType : ConnectionType }
type ConnecteeData = ConnecteeDatum[]


const createAudioNode = {
    [NodeTypes.GAIN]:   'createGain',
    [NodeTypes.OSC]:    'createOscillator',
    [NodeTypes.FILTER]: 'createBiquadFilter',
    [NodeTypes.PANNER]: 'createStereoPanner',
    [NodeTypes.DELAY]:  'createDelay'
}

const MustBeStarted = {
    [NodeTypes.GAIN]:   false,
    [NodeTypes.OSC]:    true,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]:  false
}

const SupportsInputChannels = {
    [NodeTypes.GAIN]:   true,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: true,
    [NodeTypes.PANNER]: true,
    [NodeTypes.DELAY]:  true
}

const AudioNodeParams = {
    [NodeTypes.GAIN]:   ['gain']                          as AudioParamString[],
    [NodeTypes.OSC]:    ['frequency','detune']            as AudioParamString[],
    [NodeTypes.FILTER]: ['frequency','Q','gain','detune'] as AudioParamString[],
    [NodeTypes.PANNER]: ['pan']                           as AudioParamString[],
    [NodeTypes.DELAY]:  ['delayTime']                     as AudioParamString[]
}

const AudioNodeSubTypes = {
    [NodeTypes.GAIN]:   [],
    [NodeTypes.OSC]:    ['sine','square','triangle','sawtooth'],
    [NodeTypes.FILTER]: 
        ["lowpass", "highpass", "bandpass", "lowshelf",
         "highshelf", "peaking", "notch", "allpass"],
    [NodeTypes.PANNER]: [],
    [NodeTypes.DELAY]:  []
}

const DefaultParamValues : { [key in AudioParamString] : number } = 
{
    gain: 0.5,
    frequency: 440,
    detune: 0,
    Q: 1,
    pan: 0,
    delayTime: 0.25
}

const ConnectionTypeColors : { [key in ConnectionType] : string } =
{
    channel:   'gray',
    frequency: 'blue',
    gain:      'red',
    detune:    'green',
    Q:         'violet',
    pan:       'orange',
    delayTime: 'yellow'
}

const NodeTypeColors : { [key in NodeTypes] : string } =
{
    [NodeTypes.GAIN]:   'red',
    [NodeTypes.OSC]:    'blue',
    [NodeTypes.FILTER]: 'green',
    [NodeTypes.PANNER]: 'orange',
    [NodeTypes.DELAY]:  'yellow'
}
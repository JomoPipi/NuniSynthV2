

enum NodeTypes {
    GAIN = 'gain',
    OSC = 'oscillator',
    FILTER = 'filter'
}

type ConnectionType = NodeTypes | 'channel'
type AudioNodeTypes = GainNode | OscillatorNode | BiquadFilterNode
type AudioParamString = 'gain' | 'frequency' | 'detune' | 'Q'
type ConnecteeDatum = { id : number, connectionType : ConnectionType }
type ConnecteeData = ConnecteeDatum[]


const createAudioNode = {
    [NodeTypes.GAIN]:   'createGain',
    [NodeTypes.OSC]:    'createOscillator',
    [NodeTypes.FILTER]: 'createBiquadFilter'
}

const MustBeStarted = {
    [NodeTypes.GAIN]:   false,
    [NodeTypes.OSC]:    true,
    [NodeTypes.FILTER]: false
}

const SupportsInputChannels = {
    [NodeTypes.GAIN]:   true,
    [NodeTypes.OSC]:    false,
    [NodeTypes.FILTER]: true
}

const AudioNodeParams = {
    [NodeTypes.GAIN]:   ['gain']                          as AudioParamString[],
    [NodeTypes.OSC]:    ['frequency','detune']            as AudioParamString[],
    [NodeTypes.FILTER]: ['frequency','Q','gain','detune'] as AudioParamString[]
}

const AudioNodeSubTypes = {
    [NodeTypes.GAIN]:   [],
    [NodeTypes.OSC]:    ['sine','square','triangle','sawtooth'],
    [NodeTypes.FILTER]: 
        ["lowpass", "highpass", "bandpass", "lowshelf",
         "highshelf", "peaking", "notch", "allpass"]
}

const DefaultParamValues : { [key in AudioParamString] : number } = {
    gain: 0.5,
    frequency: 440,
    detune: 0,
    Q: 1
}
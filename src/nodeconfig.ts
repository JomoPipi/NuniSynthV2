






enum NodeTypes {
    GAIN    = 'gain',
    OSC     = 'oscillator',
    FILTER  = 'filter',
    PANNER  = 'panner',
    DELAY   = 'delay',
    SAMPLER = 'sampler'
}

type AudioParams = 
    'gain' | 'frequency' | 'detune' | 'pan' | 'Q' | 'delayTime' | 'playbackRate'

type ConnectionType = 
    AudioParams | 'channel'

type ConnecteeDatum = 
    { id : number, connectionType : ConnectionType }
    
type ConnecteeData = 
    ConnecteeDatum[]


const createAudioNode = {
    [NodeTypes.GAIN]:    'createGain',
    [NodeTypes.OSC]:     'createOscillator2',
    [NodeTypes.FILTER]:  'createBiquadFilter',
    [NodeTypes.PANNER]:  'createStereoPanner',
    [NodeTypes.DELAY]:   'createDelay',
    [NodeTypes.SAMPLER]: 'createSampler'
}

const SupportsInputChannels = {
    [NodeTypes.GAIN]:    true,
    [NodeTypes.OSC]:     false,
    [NodeTypes.FILTER]:  true,
    [NodeTypes.PANNER]:  true,
    [NodeTypes.DELAY]:   true,
    [NodeTypes.SAMPLER]: false
}

const AudioNodeParams = {
    [NodeTypes.GAIN]:    ['gain']                          as AudioParams[],
    [NodeTypes.OSC]:     ['frequency','detune']            as AudioParams[],
    [NodeTypes.FILTER]:  ['frequency','Q','gain','detune'] as AudioParams[],
    [NodeTypes.PANNER]:  ['pan']                           as AudioParams[],
    [NodeTypes.DELAY]:   ['delayTime']                     as AudioParams[],
    [NodeTypes.SAMPLER]: ['playbackRate','detune']         as AudioParams[]
}

const AudioNodeSubTypes = {
    [NodeTypes.GAIN]:    [],
    [NodeTypes.OSC]:     ['sine','square','triangle','sawtooth'],
    [NodeTypes.FILTER]: 
        ["lowpass", "highpass", "bandpass", "lowshelf",
         "highshelf", "peaking", "notch", "allpass"],
    [NodeTypes.PANNER]:  [],
    [NodeTypes.DELAY]:   [],
    [NodeTypes.SAMPLER]: []
}

const NodeTypeColors : { [key in NodeTypes] : string } =
{
    [NodeTypes.GAIN]:    'rgba(255,0,0,0.25)',
    [NodeTypes.OSC]:     'rgba(0,0,255,0.25)',
    [NodeTypes.FILTER]:  'rgba(0,255,0,0.25)',
    [NodeTypes.PANNER]:  'rgba(255,128,0,0.25)',
    [NodeTypes.DELAY]:   'rgba(255,255,0,0.25)',
    [NodeTypes.SAMPLER]: 'rgba(0,255,255,0.25)'
}

const ConnectionTypeColors : { [key in ConnectionType] : string } =
{
    channel:      'gray',
    frequency:    'blue',
    gain:         'red',
    detune:       'green',
    Q:            'violet',
    pan:          'orange',
    delayTime:    'yellow',
    playbackRate: 'cyan'
}

const DefaultParamValues : { [key in AudioParams] : number } = 
{
    gain:         0.5,
    frequency:    440,
    detune:       0,
    Q:            1,
    pan:          0,
    delayTime:    0.25,
    playbackRate: 1
}

const AudioParamRanges : { [key in AudioParams] : [number,number] } = 
{
    gain:         [0, 24000],
    frequency:    [0, 24000],
    detune:       [-153600, 153600],
    Q:            [0 ,1000],
    pan:          [-1.0, 1.0],
    delayTime:    [0, 1],
    playbackRate: [0, 32],
}

const hasLinearSlider : { [key in AudioParams] : boolean } = 
{
    gain:         true,
    frequency:    false,
    detune:       true,
    Q:            true,
    pan:          true,
    delayTime:    false,
    playbackRate: false
}

const sliderFactor : { [key in AudioParams] : number } = 
{
    gain:         .025,
    frequency:    .125,
    detune:       1.0,
    Q:            .05,
    pan:          .005,
    delayTime:    .005,
    playbackRate: 2**-6
}
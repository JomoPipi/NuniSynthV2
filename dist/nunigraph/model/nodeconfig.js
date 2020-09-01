"use strict";
var NodeTypes;
(function (NodeTypes) {
    NodeTypes["GAIN"] = "gain";
    NodeTypes["OSC"] = "oscillator";
    NodeTypes["FILTER"] = "filter";
    NodeTypes["PANNER"] = "panner";
    NodeTypes["DELAY"] = "delay";
    NodeTypes["BUFFER"] = "buffer";
    NodeTypes["SGS"] = "subgraph-sequencer";
    NodeTypes["B_SEQ"] = "buffer-sequencer";
    NodeTypes["CSN"] = "constant-source";
    NodeTypes["RECORD"] = "audio-capture";
    NodeTypes["MODULE"] = "module";
})(NodeTypes || (NodeTypes = {}));
const NodeLabel = { [NodeTypes.GAIN]: 'Gain',
    [NodeTypes.OSC]: 'Oscillator',
    [NodeTypes.FILTER]: 'Filter',
    [NodeTypes.PANNER]: 'Panner',
    [NodeTypes.DELAY]: 'Delay',
    [NodeTypes.BUFFER]: 'Sample',
    [NodeTypes.SGS]: 'Gate Sequencer',
    [NodeTypes.B_SEQ]: 'Sample Sequencer',
    [NodeTypes.CSN]: 'Number Value',
    [NodeTypes.RECORD]: 'Recorder',
    [NodeTypes.MODULE]: 'Module'
};
const createAudioNode = { [NodeTypes.GAIN]: 'createGain',
    [NodeTypes.OSC]: 'createOscillator2',
    [NodeTypes.FILTER]: 'createBiquadFilter',
    [NodeTypes.PANNER]: 'createStereoPanner',
    [NodeTypes.DELAY]: 'createDelay',
    [NodeTypes.BUFFER]: 'createBuffer2',
    [NodeTypes.SGS]: 'createGateSequencer',
    [NodeTypes.B_SEQ]: 'createSampleSequencer',
    [NodeTypes.CSN]: 'createConstantSource',
    [NodeTypes.RECORD]: 'createAudioBufferCaptureNode',
    [NodeTypes.MODULE]: 'createNuniGraphAudioNode'
};
const SupportsInputChannels = { [NodeTypes.GAIN]: true,
    [NodeTypes.OSC]: false,
    [NodeTypes.FILTER]: true,
    [NodeTypes.PANNER]: true,
    [NodeTypes.DELAY]: true,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]: true,
    [NodeTypes.B_SEQ]: false,
    [NodeTypes.CSN]: false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.MODULE]: true
};
const IsAwareOfInputIDs = { [NodeTypes.GAIN]: false,
    [NodeTypes.OSC]: false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]: false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]: true,
    [NodeTypes.B_SEQ]: false,
    [NodeTypes.CSN]: false,
    [NodeTypes.RECORD]: false,
    [NodeTypes.MODULE]: true
};
const MustBeStarted = { [NodeTypes.GAIN]: false,
    [NodeTypes.OSC]: false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]: false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]: false,
    [NodeTypes.B_SEQ]: false,
    [NodeTypes.CSN]: true,
    [NodeTypes.RECORD]: false,
    [NodeTypes.MODULE]: false
};
const HasNoAudioParams = { [NodeTypes.GAIN]: false,
    [NodeTypes.OSC]: false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]: false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]: true,
    [NodeTypes.B_SEQ]: true,
    [NodeTypes.CSN]: false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.MODULE]: true
};
const HasNoOutput = { [NodeTypes.GAIN]: false,
    [NodeTypes.OSC]: false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]: false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]: false,
    [NodeTypes.B_SEQ]: false,
    [NodeTypes.CSN]: false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.MODULE]: false
};
const OpensDialogBoxWhenConnectedTo = { [NodeTypes.GAIN]: false,
    [NodeTypes.OSC]: false,
    [NodeTypes.FILTER]: false,
    [NodeTypes.PANNER]: false,
    [NodeTypes.DELAY]: false,
    [NodeTypes.BUFFER]: false,
    [NodeTypes.SGS]: true,
    [NodeTypes.B_SEQ]: false,
    [NodeTypes.CSN]: false,
    [NodeTypes.RECORD]: true,
    [NodeTypes.MODULE]: true
};
const AudioNodeParams = { [NodeTypes.GAIN]: ['gain'],
    [NodeTypes.OSC]: ['frequency', 'detune'],
    [NodeTypes.FILTER]: ['frequency', 'Q', 'gain', 'detune'],
    [NodeTypes.PANNER]: ['pan'],
    [NodeTypes.DELAY]: ['delayTime'],
    [NodeTypes.BUFFER]: ['playbackRate', 'detune'],
    [NodeTypes.SGS]: [],
    [NodeTypes.B_SEQ]: ['playbackRate', 'detune'],
    [NodeTypes.CSN]: ['offset'],
    [NodeTypes.RECORD]: [],
    [NodeTypes.MODULE]: []
};
const AudioNodeSubTypes = { [NodeTypes.GAIN]: [],
    [NodeTypes.OSC]: ['sine', 'square', 'triangle', 'sawtooth', 'custom'],
    [NodeTypes.FILTER]: ["lowpass", "highpass", "bandpass", "lowshelf",
        "highshelf", "peaking", "notch", "allpass"],
    [NodeTypes.PANNER]: [],
    [NodeTypes.DELAY]: [],
    [NodeTypes.BUFFER]: [],
    [NodeTypes.SGS]: [],
    [NodeTypes.B_SEQ]: [],
    [NodeTypes.CSN]: [],
    [NodeTypes.RECORD]: [],
    [NodeTypes.MODULE]: []
};
const MasterGainColor = '#555';
const NodeTypeColors = { [NodeTypes.GAIN]: 'rgba(255,0,0,0.5)',
    [NodeTypes.OSC]: 'rgba(0,0,255,0.5)',
    [NodeTypes.FILTER]: 'rgba(0,255,0,0.5)',
    [NodeTypes.PANNER]: 'rgba(255,128,0,0.5)',
    [NodeTypes.DELAY]: 'rgba(255,255,0,0.5)',
    [NodeTypes.BUFFER]: 'rgba(0,255,255,0.5)',
    [NodeTypes.SGS]: 'rgba(255,0,255,0.5)',
    [NodeTypes.B_SEQ]: 'rgba(0,255,195,0.5)',
    [NodeTypes.CSN]: 'rgba(255,200,200,0.5)',
    [NodeTypes.RECORD]: 'rgba(255,200,255,1)',
    [NodeTypes.MODULE]: 'rgba(255,240,255,0.5)'
};
const NodeTypeWarnings = { [NodeTypes.FILTER]: `Filters may become unstable and we won't do anything about it. If this happens the program will cease to function properly and will need to be re-started.`
};
const ConnectionTypeColors = { channel: 'gray',
    frequency: 'rgb(50, 50, 255)',
    gain: 'red',
    detune: 'green',
    Q: 'violet',
    pan: 'orange',
    delayTime: 'yellow',
    playbackRate: 'cyan',
    offset: 'rgb(255,200,200)'
};
const DefaultParamValues = { gain: 1,
    frequency: 440,
    detune: 0,
    Q: 1,
    pan: 0,
    delayTime: 0.5,
    playbackRate: 1,
    offset: 0
};
const AudioParamRanges = { gain: [0, 24000],
    frequency: [0, 24000],
    detune: [-153600, 153600],
    Q: [0, 20],
    pan: [-1.0, 1.0],
    delayTime: [0, 1],
    playbackRate: [0, 32],
    offset: [-1e5, 1e5]
};
const hasLinearSlider = { gain: false,
    frequency: false,
    detune: true,
    Q: true,
    pan: true,
    delayTime: false,
    playbackRate: false,
    offset: false
};
const isSubdividable = { gain: false,
    frequency: true,
    detune: false,
    Q: false,
    pan: false,
    delayTime: true,
    playbackRate: false,
    offset: false
};
const sliderFactor = { gain: 10 ** -2,
    frequency: 2 ** -7,
    detune: 1.0,
    Q: .05,
    pan: .005,
    delayTime: .005,
    playbackRate: 2 ** -6,
    offset: 10 ** -2
};
const Transferable_AudioNodeProperties = { type: true,
    kbMode: true,
    subdiv: true,
    isInSync: true,
    bufferKey: true,
    nSteps: true,
    adsrIndex: true,
    graphCode: true,
    stepMatrix: true,
    phaseShift: true,
    channelData: true
};
const PostConnection_Transferable_InputRemappable_AudioNodeProperties = { [NodeTypes.SGS]: ['stepMatrix', 'channelData']
};
const TransferableNodeProperties = 'id,type,x,y,audioParamValues,audioNodeProperties,title,INPUT_NODE_ID'
    .split(',')
    .reduce((acc, prop) => (Object.assign(Object.assign({}, acc), { [prop]: true })), {});
//# sourceMappingURL=nodeconfig.js.map
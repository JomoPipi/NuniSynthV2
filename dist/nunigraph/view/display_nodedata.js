import { sequencerControls } from './sequencer_controls.js';
import { BufferUtils } from '../../buffer_utils/internal.js';
import { audioCaptureNodeControls } from './audio_capture_controls.js';
import { createResizeableGraphEditor } from './resizeable_graph_editor.js';
import { NuniSourceNode, BufferNode2, Sequencer, AudioBufferCaptureNode, NuniGraphAudioNode } from '../../webaudio2/internal.js';
import { createDraggableNumberInput, createToggleButton, applyStyle, JsDial } from '../../UI_library/internal.js';
export function createValuesWindow(node, saveCallback, deleteCallback) {
    const controls = E('div');
    controls.appendChild(showSubtypes(node, saveCallback));
    if (NodeTypeWarnings[node.type]) {
        controls.appendChild(warningButton(node.type));
    }
    if (node.audioNode instanceof NuniGraphAudioNode) {
        controls.style.margin = '0 0';
        controls.appendChild(createResizeableGraphEditor(node.audioNode));
    }
    if (node.audioNode instanceof AudioBufferCaptureNode) {
        controls.appendChild(audioCaptureNodeControls(node.audioNode));
    }
    if (node.audioNode instanceof Sequencer) {
        controls.appendChild(sequencerControls(node.audioNode));
    }
    if (node.audioNode instanceof BufferNode2) {
        controls.appendChild(samplerControls(node.audioNode));
    }
    if (node.audioNode instanceof NuniSourceNode) {
        controls.appendChild(activateKeyboardButton(node.audioNode));
    }
    if (node.id === 0) {
        controls.appendChild(gainControls(node));
    }
    else if (node.type !== NodeTypes.B_SEQ) {
        controls.appendChild(exposeAudioParams(node, saveCallback));
    }
    return controls;
}
function warningButton(type) {
    return E('span', {
        text: '!',
        className: 'tooltip',
        children: [E('span', {
                text: NodeTypeWarnings[type],
                className: 'tooltiptext'
            })],
        props: { style: {
                width: '20px',
                height: '20px',
                float: 'right',
                backgroundColor: ' orange'
            } }
    });
}
function gainControls(node) {
    const value = node.audioNode.gain.value;
    const dial = new JsDial(1);
    dial.min = 0.1;
    dial.max = Math.SQRT2;
    dial.value = value ** (1 / 4.0);
    dial.sensitivity = 2 ** -9;
    dial.render();
    const valueText = E('span', {
        text: `${volumeTodB(value).toFixed(1)}dB`
    });
    applyStyle(valueText, {
        display: 'inline-block',
        width: '70px'
    });
    dial.attach((v) => {
        const value = v ** 4.0;
        node.setValueOfParam('gain', value);
        valueText.innerText =
            `${volumeTodB(value).toFixed(1)}dB`;
    });
    const box = E('div', { children: [dial.html, valueText] });
    return box;
}
function activateKeyboardButton(an) {
    return createToggleButton(an, 'kbMode', { text: '🎹',
        className: 'kb-button' });
}
function showSubtypes(node, saveCallback) {
    const subtypes = AudioNodeSubTypes[node.type];
    const box = E('span');
    const an = node.audioNode;
    if (subtypes.length > 0) {
        const select = E('select');
        insertOptions(select, subtypes);
        select.value = an.type;
        select.oninput = function () {
            saveCallback();
            an.type = select.value;
        };
        box.appendChild(select);
    }
    return box;
}
function insertOptions(select, options) {
    select.innerHTML =
        options.map(type => `<option>${type}</option>`).join('');
}
function samplerControls(audioNode) {
    const box = E('span', {
        className: 'buffer-row',
        children: [E('span', { text: 'buffer' })]
    });
    const value = E('span', { text: String.fromCharCode(65 + audioNode.bufferKey) });
    box.appendChild(value);
    ['-', '+'].forEach((op, i) => {
        const btn = E('button', { text: op });
        btn.onclick = () => {
            const v = clamp(0, audioNode.bufferKey + Math.sign(i - .5), BufferUtils.nBuffers - 1);
            value.innerText = String.fromCharCode(65 + v);
            audioNode.bufferKey = v;
        };
        box.appendChild(btn);
    });
    box.appendChild(createToggleButton(audioNode, 'loop', { update: (on) => audioNode.refresh() }));
    return box;
}
function exposeAudioParams(node, saveCallback) {
    const allParams = E('div');
    for (const param of AudioNodeParams[node.type]) {
        const box = E('div', {
            className: 'params-box',
            text: param
        });
        const initialValue = node.audioParamValues[param];
        const updateFunc = createUpdateParamFunc(node, param);
        const mousedownFunc = () => {
            saveCallback();
            return node.audioParamValues[param];
        };
        const manualUpdater = (x) => {
            saveCallback();
            node.setValueOfParam(param, x);
        };
        box.appendChild(createDraggableNumberInput(initialValue, mousedownFunc, updateFunc, manualUpdater));
        allParams.appendChild(box);
    }
    return allParams;
}
function createUpdateParamFunc(node, param) {
    return (delta, value) => {
        const amount = sliderFactor[param];
        const [min, max] = AudioParamRanges[param];
        const useLinear = hasLinearSlider[param] || value === 0;
        const factor = useLinear ? delta : delta * value;
        const newValue = clamp(min, value + factor * amount, max);
        node.setValueOfParam(param, newValue);
        return newValue.toPrecision(5);
    };
}
//# sourceMappingURL=display_nodedata.js.map
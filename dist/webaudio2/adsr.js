import { JsDial, createRadioButtonGroup } from "../UI_library/internal.js";
const releaseTimeConstant = 10;
const waveArray = new Float32Array(9);
waveArray[0] = 0.5;
waveArray[1] = 1;
waveArray[2] = 0.5;
waveArray[3] = 0;
waveArray[4] = 0.5;
waveArray[5] = 6;
waveArray[6] = 0.5;
waveArray[7] = 0;
waveArray[8] = 0.5;
var createLogarithmicBuffer = function createLogarithmicBuffer(direction = 1, base, length) {
    base = base || 10,
        length = length || 100;
    const curve = new Float32Array(length);
    let percent = 0, index, i;
    for (i = 0; i < length; i++) {
        index = direction > 0 ? i : length - 1 - i;
        percent = i / length;
        curve[index] = Math.log(1 + base * percent) / Math.log(1 + base);
    }
    return curve;
};
const logarUp = createLogarithmicBuffer(1);
const logarDown = createLogarithmicBuffer(-1);
const N_ADSRs = 4;
const defaultADSR = () => ({ attack: 0.010416984558105469,
    decay: 0.17708349227905273,
    sustain: 0.2166603088378906,
    release: 0.3812504768371582, curve: 'exponential'
});
const canvas = D('adsr-canvas');
export const ADSR_Controller = {
    canvas,
    index: 0,
    values: [...Array(N_ADSRs)].map(defaultADSR),
    trigger: function (gain, time, volume, adsrIndex) {
        const { attack, decay, sustain, curve } = this.values[adsrIndex];
        gain.cancelScheduledValues(time);
        if (curve === 'linear') {
            gain.linearRampToValueAtTime(0.01, time);
            gain.linearRampToValueAtTime(volume, attack + time);
            gain.linearRampToValueAtTime(volume * sustain ** 2, time + attack + decay);
        }
        else if (curve === 'exponential') {
            gain.exponentialRampToValueAtTime(0.01, time);
            gain.exponentialRampToValueAtTime(volume, attack + time);
            gain.exponentialRampToValueAtTime(volume * sustain ** 2, time + attack + decay);
        }
        else if (curve === 'logarithmic') {
            gain.setValueCurveAtTime(logarUp, time, attack);
            gain.setValueCurveAtTime(logarDown, time + attack, decay);
        }
        else {
            gain.setTargetAtTime(volume, time, attack);
            gain.setTargetAtTime(volume * sustain ** 2, time + attack, decay);
        }
    },
    triggerSource: function (source, gain, time, volume, index) {
        const { attack, decay, sustain } = this.values[index ?? this.index];
        gain.cancelScheduledValues(time);
        gain.setTargetAtTime(volume, time, attack);
        gain.setTargetAtTime(volume * sustain ** 2, time + attack, decay);
        source.start(time);
    },
    untriggerAdsr: function (gain, time, index) {
        const { release } = this.values[index ?? this.index];
        gain.cancelScheduledValues(time);
        gain.setTargetAtTime(0, time, release);
    },
    untriggerAndGetStopTime: function (gain, time, index) {
        const { release } = this.values[index ?? this.index];
        gain.cancelScheduledValues(time);
        gain.setTargetAtTime(0, time, release);
        return time + release * releaseTimeConstant;
    },
    render: (options) => { }
};
canvas.onclick = () => {
    const adsr = ADSR_Controller.values[ADSR_Controller.index];
    const next = { linear: 'logarithmic', logarithmic: 'exponential', exponential: 'S', S: 'linear' };
    adsr.curve = next[adsr.curve];
    ADSR_Controller.render();
};
{
    const adsr = ADSR_Controller;
    const isAux = false;
    const ctx = adsr.canvas.getContext('2d');
    adsr.render = function (options = {}) {
        const H = this.canvas.height, W = this.canvas.width;
        ctx.lineWidth = 5;
        const { attack, decay, sustain, release } = this.values[this.index];
        const sum = attack + decay + 0.25 + release;
        const adsrWidths = [
            attack / sum,
            decay / sum,
            0.25 / sum,
        ];
        const [aw, dw, sw] = adsrWidths;
        const t1 = aw;
        const t2 = t1 + dw;
        const t3 = t2 + sw;
        const t4 = 1;
        const margin = 5;
        const arr = [
            [t1, 0],
            [t2, 1 - sustain],
            [t3, 1 - sustain],
            [t4, 1]
        ];
        if (isAux) {
            arr[1][1] = 1;
            arr[2] = arr[3];
        }
        ctx.clearRect(0, 0, W, H);
        let lastX = margin, lastY = H - margin;
        arr.forEach(([x, y], i) => {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.strokeStyle = '#8a8,#a88,#88a,#a8a'.split(',')[i];
            lastX = x * (W - margin * 2) + margin,
                lastY = y * (H - margin * 2) + margin;
            ctx.lineTo(lastX, lastY);
            ctx.stroke();
            ctx.closePath();
        });
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.font = '20px arial';
        ctx.fillText(ADSR_Controller.values[ADSR_Controller.index].curve, W - 110, 20);
        if (options.updateKnobs) {
            updateKnobs();
        }
    };
    adsr.render();
}
const knobs = D('adsr-knobs');
const ADSR = 'attack,decay,sustain,release'.split(',');
const adsrDials = ADSR.reduce((a, s) => {
    const dial = new JsDial();
    const adsr = ADSR_Controller;
    dial.value = adsr.values[adsr.index][s];
    dial.sensitivity = 2 ** -10;
    dial.render();
    dial.attach((value) => {
        adsr.values[adsr.index][s] = value * value;
        adsr.render();
    });
    knobs.appendChild(dial.html);
    a[s] = dial;
    return a;
}, {});
{
    D('select-adsr').appendChild(createRadioButtonGroup({
        text: 'ADSR',
        buttons: [...'ABCD'],
        selected: 'A',
        className: 'top-bar-btn',
        onclick: (data, index) => {
            const adsr = ADSR_Controller;
            adsr.index = index;
            adsr.render({ updateKnobs: true });
        }
    }));
}
function updateKnobs() {
    const adsr = ADSR_Controller;
    for (const s of ADSR) {
        adsrDials[s].update(adsr.values[adsr.index][s] ** .5);
    }
}
//# sourceMappingURL=adsr.js.map
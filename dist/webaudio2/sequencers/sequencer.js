import { MasterClock } from './master_clock.js';
import { VolumeNodeContainer } from '../volumenode_container.js';
import { JsDial } from '../../UI_library/internal.js';
export class Sequencer extends VolumeNodeContainer {
    constructor(ctx) {
        super(ctx);
        this.nSteps = 8;
        this.subdiv = 8;
        this.currentStep = 0;
        this.startTime = 0;
        this.noteTime = 0;
        this.phaseShift = 0;
        this.adsrIndex = 0;
        this.soloChannel = -1;
        this.ctx = ctx;
        this.tick = (60 * 4 / MasterClock.getTempo()) / this.subdiv;
        this.HTMLGrid = createBeatGrid();
        this.isInSync = true;
        this.isPlaying = true;
        this.windowIsOpen = false;
        this.stepMatrix = {};
        this.mutedChannel = {};
        this.HTMLBoxes = {};
        this.channelData = {};
    }
    updateTempo(tempo) {
        tempo = clamp(1, tempo, Infinity);
        const newTick = (60 * 4 / tempo) / this.subdiv;
        if (this.tick !== newTick) {
            this.tick = newTick;
            if (this.isInSync) {
                this.stop();
                this.play();
            }
        }
    }
    createStepRow() {
        const row = Array(this.nSteps).fill(0);
        row[0] = 1;
        return row;
    }
    updateSteps(nSteps) {
        const m = this.stepMatrix;
        for (const key in m) {
            if (m[key].length < nSteps) {
                m[key] = m[key].concat(Array(nSteps - m[key].length).fill(0));
            }
            else {
                m[key] = m[key].slice(0, nSteps);
            }
        }
        this.nSteps = nSteps;
    }
    play() {
        this.isPlaying = true;
        this.noteTime = 0;
        this.currentStep = 0;
        this.startTime = this.isInSync ? 0 : this.ctx.currentTime + 0.005;
    }
    scheduleNotes(tempo) {
        if (!this.isPlaying)
            return;
        this.updateTempo(tempo);
        const time = this.ctx.currentTime;
        const currentTime = time - this.startTime;
        let updateBox = true && this.noteTime > 0;
        while (this.noteTime < currentTime + 0.200) {
            const patternTime = this.noteTime + this.startTime;
            if (patternTime > time) {
                this.playStepsAtTime(patternTime, updateBox);
            }
            updateBox = false;
            this.nextNote();
        }
    }
    nextNote() {
        this.currentStep++;
        if (this.currentStep >= this.nSteps)
            this.currentStep = 0;
        this.noteTime += this.tick;
    }
    playStepsAtTime(time, updateBox) {
        const boxIsVisible = this.HTMLGrid.offsetParent != null;
        const playRow = (key) => {
            var _a, _b;
            const stepIsActive = this.stepMatrix[key][this.currentStep];
            if (!this.mutedChannel[key]) {
                if (boxIsVisible && updateBox) {
                    (_a = this.HTMLBoxes[key][this.currentStep]) === null || _a === void 0 ? void 0 : _a.classList.add('highlighted');
                    const lastStep = (this.currentStep + this.nSteps - 1) % this.nSteps;
                    (_b = this.HTMLBoxes[key][lastStep]) === null || _b === void 0 ? void 0 : _b.classList.remove('highlighted');
                }
                if (stepIsActive) {
                    this.playStepAtTime(key, time + this.phaseShift);
                }
            }
        };
        if (this.soloChannel >= 0) {
            playRow(this.soloChannel);
        }
        else {
            for (const key in this.channelData) {
                playRow(+key);
            }
        }
    }
    playStepAtTime(key, time) {
        throw 'Implement this in a concrete class.';
    }
    stop() {
        this.isPlaying = false;
        for (const key in this.HTMLBoxes) {
            for (const step in this.HTMLBoxes[key]) {
                this.HTMLBoxes[key][step].classList.remove('highlighted');
            }
        }
    }
    refresh() {
        this.setupGrid();
    }
    setupGrid() {
        this.HTMLGrid.innerHTML = '';
        this.HTMLBoxes = {};
        const grid = this.HTMLGrid;
        const { nSteps, channelData, mutedChannel } = this;
        const soloButtons = [];
        for (const key in channelData) {
            const row = E('div', { className: 'flex-center' });
            row.appendChild(rowOptions(this.additionalRowItems(+key), key));
            this.HTMLBoxes[key] = {};
            for (let i = 0; i < nSteps; i++) {
                const box = E('span');
                this.HTMLBoxes[key][i] = box;
                box.classList.add('note-box'
                    + (i === 0
                        || i === nSteps / 2
                        || i === nSteps / 4
                        || i === 3 * nSteps / 4
                        ? '-halfway'
                        : ''));
                const boxSize = clamp(10, 100 / nSteps ** 0.5, 35);
                box.style.width = `${boxSize / PHI}px`;
                box.style.height = '35px';
                box.classList.toggle('selected', this.stepMatrix[key][i]);
                box.dataset.sequencerKey = `${key}:${i}`;
                row.style.height = '35px';
                row.appendChild(box);
            }
            grid.appendChild(row);
        }
        grid.onclick = (e) => {
            const box = e.target;
            if (box.dataset.sequencerKey) {
                const turnOn = box.classList.toggle('selected');
                const [key, i] = box.dataset.sequencerKey.split(':').map(Number);
                this.stepMatrix[key][i] = turnOn;
            }
            else if (box.dataset.sequencerRowKey) {
                const key = +box.dataset.sequencerRowKey;
                const mutesolo = box.innerText;
                const activate = box.classList.toggle('selected');
                if (mutesolo === 'M') {
                    this.mutedChannel[key] = activate;
                }
                else if (mutesolo === 'S') {
                    for (const button of soloButtons) {
                        if (button !== e.target) {
                            button.classList.remove('selected');
                        }
                    }
                    this.soloChannel = activate
                        ? key
                        : -1;
                }
            }
        };
        function rowOptions(items, key) {
            const box = E('span');
            mute_solo_box: {
                const muteSoloBox = E('span');
                const mute = E('button', { className: 'top-bar-btn',
                    text: 'M'
                });
                const solo = E('button', { className: 'top-bar-btn',
                    text: 'S'
                });
                mute.dataset.sequencerRowKey =
                    solo.dataset.sequencerRowKey = key;
                mute.classList.toggle('selected', mutedChannel[key] === true);
                muteSoloBox.append(items, mute, solo);
                soloButtons.push(solo);
                box.appendChild(muteSoloBox);
            }
            add_volume_knob: {
                const value = channelData[key].volume;
                const dial = new JsDial();
                dial.min = 0.1;
                dial.max = Math.SQRT2;
                dial.value = value ** (1 / 4.0);
                dial.sensitivity = 2 ** -9;
                dial.imgDegreeOffset = 200;
                dial.size = 30;
                dial.render();
                const valueText = E('span', { text: volumeTodB(value).toFixed(1) + 'dB' });
                dial.attach((value) => {
                    const v = value ** 4.0;
                    channelData[key].volume = v;
                    valueText.innerText =
                        volumeTodB(v).toFixed(1) + 'dB';
                });
                dial.attachDoubleClick(() => {
                    dial.value = 1;
                    channelData[key].volume = 1;
                    valueText.innerText = '0.0dB';
                });
                box.append(dial.html, valueText);
            }
            return box;
        }
    }
    additionalRowItems(key) {
        return E('span');
    }
}
function createBeatGrid() {
    const grid = E('div');
    grid.style.marginBottom = '5px';
    return grid;
}
//# sourceMappingURL=sequencer.js.map
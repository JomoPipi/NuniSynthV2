import { ADSR_Controller } from '../adsr.js';
import { KB } from './keyboard.js';
import { VolumeNodeContainer } from '../volumenode_container.js';
export class NuniSourceNode extends VolumeNodeContainer {
    constructor(ctx) {
        super(ctx);
        this.playingKeys = {};
        this.stopLastNSources = [];
        this._kbMode = false;
    }
    get kbMode() { return this._kbMode; }
    set kbMode(mode) {
        this._kbMode = mode;
        this.refresh();
    }
    createSource() {
        throw 'Must be implemented in the "concrete" classes.';
    }
    refresh() {
        if (this.soloSource) {
            this.soloSource.stop(0);
            delete this.soloSource;
        }
        this.playingKeys = {};
        this.stopLastNSources = [];
        if (!this.kbMode) {
            const src = this.createSource();
            const adsr = this.ctx.createGain();
            const t = this.ctx.currentTime;
            adsr.gain.setValueAtTime(1, t);
            adsr.connect(this.volumeNode);
            src.connect(adsr);
            src.start(t);
            this.soloSource = src;
        }
    }
    playKeyAtTime(key, time, duration) {
        const src = this.createSource();
        src.detune.value = KB.scale[KB.keymap[key]];
        const adsr = this.ctx.createGain();
        adsr.gain.setValueAtTime(1.0 / KB.nVoices, 0);
        adsr.connect(this.volumeNode);
        src.connect(adsr);
        ADSR_Controller.triggerSource(src, adsr.gain, time, 1);
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time + duration);
        src.stop(stopTime);
    }
    update(keydown, key, when) {
        if (!this.kbMode)
            return;
        const time = when ?? this.ctx.currentTime;
        if (keydown) {
            this.beginPlayingNote(key, time);
            this.stopLastNSources.push(this.playingKeys[key]);
            while (this.stopLastNSources.length >= KB.nVoices + 1) {
                this.stopLastNSources.shift().stopImmediately();
            }
        }
        else {
            this.playingKeys[key]?.stop(time);
            delete this.playingKeys[key];
        }
    }
    beginPlayingNote(key, time) {
        if (this.playingKeys[key]) {
            this.playingKeys[key].stop(time);
        }
        const src = this.createSource();
        src.detune.value = KB.scale[KB.keymap[key]];
        const adsr = this.ctx.createGain();
        adsr.gain.setValueAtTime(1.0 / 44.0, 0);
        adsr.connect(this.volumeNode);
        src.connect(adsr);
        ADSR_Controller.triggerSource(src, adsr.gain, time, 1);
        this.playingKeys[key] = {
            stop: (time) => src.stop(ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time)),
            stopImmediately: () => src.stop(this.ctx.currentTime)
        };
    }
}
//# sourceMappingURL=nuni_source_node.js.map
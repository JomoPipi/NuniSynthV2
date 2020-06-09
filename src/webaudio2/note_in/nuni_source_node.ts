






import { ADSR_Controller } from '../adsr.js'
import KB from './keyboard.js'
import VolumeNodeContainer from '../volumenode_container.js'




type SoundSource = OscillatorNode | AudioBufferSourceNode

type StopFunc = { 
    stop: (when : number ) => void 
    stopImmediately: () => void
}

export class NuniSourceNode extends VolumeNodeContainer {
    /** Parent interface for Sampler and Oscillator nodes
     *  Allows for 3 keyboard modes - none | mono | poly
     */
    
    private playingKeys : Indexable<StopFunc>
    private stopLastNSources : StopFunc[]
    private _kbMode : boolean
    protected soloSource? : SoundSource
    
    constructor(ctx : AudioContext){
        super(ctx)
        this.playingKeys = {}
        this.stopLastNSources = []
        this._kbMode = false
    }

    get kbMode() { return this._kbMode }

    set kbMode(mode : boolean) { 
        this._kbMode = mode
        this.refresh()
    }


    createSource() : AudioBufferSourceNode | OscillatorNode {
        throw 'Must be implemented in the "concrete" classes.'
    }

    refresh() {
        if (this.soloSource) {
            this.soloSource.stop(0)
            delete this.soloSource
        }
        this.playingKeys = {}
        this.stopLastNSources = []

        if (!this.kbMode) {
            const src = this.createSource()
            const adsr = this.ctx.createGain()
            const t = this.ctx.currentTime
            adsr.gain.setValueAtTime(1, t)
            adsr.connect(this.volumeNode)
            
            src.connect(adsr)
            src.start(t)
            this.soloSource = src
        }
    }

    playKeyAtTime(key : number, time : number, duration : number) {

        const src = this.createSource()
        src.detune.value = KB.scale[KB.keymap[key]]

        const adsr = this.ctx.createGain()
        adsr.gain.setValueAtTime(1.0/KB.nVoices, 0)
        adsr.connect(this.volumeNode)
        
        src.connect(adsr)
        ADSR_Controller.triggerSource(src, adsr.gain, time)
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time + duration)
        src.stop(stopTime)
    }

    update(keydown : boolean, key : number, when? : number) {
        if (!this.kbMode) return;
        const time = when ?? this.ctx.currentTime
        if (keydown) {
            this.beginPlayingNote(key, time)

            this.stopLastNSources.push(this.playingKeys[key])
            while (this.stopLastNSources.length >= KB.nVoices + 1) {
                this.stopLastNSources.shift()!.stopImmediately()
            }
            
        } else {
            this.playingKeys[key]?.stop(time)
            delete this.playingKeys[key]
        }
    }

    beginPlayingNote(key : number, time : number) {

        if (this.playingKeys[key]) {
            this.playingKeys[key].stop(time)
        }

        const src = this.createSource()
        src.detune.value = KB.scale[KB.keymap[key]]

        const adsr = this.ctx.createGain()
        adsr.gain.setValueAtTime(1.0/44.0, 0)
        adsr.connect(this.volumeNode)
        
        src.connect(adsr)
        
        ADSR_Controller.triggerSource(src, adsr.gain, time)
        
        this.playingKeys[key] = {
            stop: (time : number) =>
                src.stop(ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time)),
            
            stopImmediately: () => src.stop(this.ctx.currentTime)
        }
    }

}
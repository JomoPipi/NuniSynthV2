






import { ADSR_Controller } from '../adsr/adsr.js'
import { KB } from './keyboard.js'
import { VolumeNodeContainer } from '../volumenode_container.js'


type Source = AudioBufferSourceNode | OscillatorNode

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

    localADSR : ADSRData = 
        { attack: 0.01
        , decay: 0.17
        , sustain: 0.21
        , release: 0.0//38
        , curve: 'exponential' as CurveType
        }
    
    constructor(ctx : AudioContext) {
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

    volumeLevelUpperLimit = 1
    private _volumeLevel = 1
    get volumeLevel() {
        return this._volumeLevel
    }
    set volumeLevel(level : number) {
        this._volumeLevel = level
        this.volumeNode.gain.value = level
    }

    createSource() : Source {
        throw 'Must be implemented in the "concrete" classes.'
    }

    refresh() {
        if (this.soloSource) 
        {
            this.soloSource.stop(0)
            delete this.soloSource
        }
        this.playingKeys = {}
        this.stopLastNSources = []

        if (!this.kbMode)
        {
            const src = this.createSource()
            const adsr = this.ctx.createGain()
            const t = this.ctx.currentTime
            const offset = src instanceof AudioBufferSourceNode
                ? src.loopStart : 0

            adsr.gain.setValueAtTime(1, t)
            adsr.connect(this.volumeNode)
            
            src.connect(adsr)
            src.start(t, offset)
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
        ADSR_Controller.triggerSource(src, adsr.gain, time, 1, this.localADSR)
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time + duration, -1, this.localADSR)
        src.stop(stopTime)
    }

    update(keydown : boolean, key : number, when? : number) {
        if (!this.kbMode) return;
        const time = when ?? this.ctx.currentTime
        if (keydown) 
        {
            this.beginPlayingNote(key, time)

            this.stopLastNSources.push(this.playingKeys[key])
            while (this.stopLastNSources.length >= KB.nVoices + 1) 
            {
                this.stopLastNSources.shift()!.stopImmediately()
            }
            
        } 
        else 
        {
            this.playingKeys[key]?.stop(time)
            delete this.playingKeys[key]
        }
    }

    beginPlayingNote(key : number, time : number) {

        if (this.playingKeys[key]) 
        {
            this.playingKeys[key].stop(time)
        }

        const src = this.createSource()
        src.detune.value = KB.scale[KB.keymap[key]]

        const adsr = this.ctx.createGain()
        adsr.gain.setValueAtTime(1.0/44.0, 0)
        adsr.connect(this.volumeNode)
        
        src.connect(adsr)
        
        ADSR_Controller.triggerSource(src, adsr.gain, time, -1, this.localADSR)
        
        this.playingKeys[key] = {
            stop: (time : number) =>
                src.stop(ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time, -1, this.localADSR)),
            
            stopImmediately: () => src.stop(this.ctx.currentTime)
        }
    }

}
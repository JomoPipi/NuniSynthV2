






import { Adsr, ADSR_Controller } from './adsr.js'
import { KB, NodeKbMode } from '../webaudio2/keyboard.js'
import { SubgraphSequencer } from './sequencers/subgraph-sequencer.js'
import AdsrSplitter from './adsr-splitter.js'
import { OscillatorNode2 } from './oscillator2.js'

export type Destination = AudioNode | AudioParam | NuniSourceAudioParam | SubgraphSequencer




export class NuniSourceAudioParam {
    /** AudioParams that are compatible with NuniSourceNodes
     */
    src: ConstantSourceNode

    constructor(ctx : AudioContext) {
        this.src = ctx.createConstantSource()
        this.src.offset.value = 0
        this.src.start(ctx.currentTime)
    }
    
    setValueAtTime(value : number, time : never) {
        this.src.offset.value = value
    }
    // implement the rest of the value changing methods if aux-AD or glide is desired
}




export class NuniSourceNode extends AdsrSplitter {
    /** Parent interface for Sampler and Oscillator nodes
     *  Allows for 3 keyboard modes - none | mono | poly
     */
    private outputs : Destination[]    // The list of things that the node connects to
    ADSRs : Indexable<Adsr>            // The gain-ADSRs
    protected sources : Indexed        // The AudioScheduledSourceNode containers
    kbMode : NodeKbMode                // The current state of the node - none | mono | poly
    readonly MONO : 666420             // The Id of the mono ADSR and source
    
    constructor(ctx : AudioContext){
        super(ctx)
        this.MONO = 666420
        this.kbMode = 'poly'
        this.sources = {}
        this.ADSRs = {}
        this.outputs = []
    }

    setKbMode(mode : NodeKbMode) {
        this.disconnectAllConnectees()

        this.kbMode = mode

        if (mode === 'none') {
            this.switchToNone()

        } else if (mode === 'mono') {
            this.switchToMono()

        } else if (mode === 'poly') {
            this.switchToPoly() 
        }

        this.reconnectAllConnectees()
    }

    private disconnectAllConnectees() {
        for (const key in this.ADSRs) {
            this.sources[key].disconnect()
            this.ADSRs[key].disconnect()
            clearTimeout(this.ADSRs[key].releaseId)
        }
        this.sources = {}
        this.ADSRs = {}
    }
    
    private switchToNone() {
        this.ADSRs[this.MONO] = new Adsr(this.ctx)
        this.ADSRs[this.MONO].gain.setValueAtTime(1, this.ctx.currentTime)
        this.sources = {}
        this.refresh()
    }
    
    private switchToMono() {
        this.ADSRs[this.MONO] = new Adsr(this.ctx)
        this.sources = {}
        this.refresh()
    }

    private switchToPoly() {
        this.ADSRs = KB.keyCodes.reduce((adsr,key) => {
            adsr[key] = new Adsr(this.ctx)
            return adsr
        }, {} as Indexable<Adsr>)
        
        this.refresh()
    }

    private reconnectAllConnectees() {
        for (const key in this.ADSRs) {
            this.ADSRs[key].connect(this.volumeNode)
        }
        this.outputs.forEach(c => {
            this.connection(true, c)
        })
    }

    refresh() {
        if (this.kbMode === 'poly') {
            KB.keyCodes.forEach(key =>
                this.prepareSource(key))

        } else if (this.kbMode === 'mono') {
            this.prepareSource(this.MONO)

        } else if (this.kbMode === 'none') {
            this.prepareSource(this.MONO) 
            this.startSource(this.MONO)
            this.ADSRs[this.MONO].gain.value = 1
        }
        else throw 'How could such a thing be?'
    }

    update(keydown : boolean, key : number) {
        if (this.kbMode === 'poly') {
            if (keydown) {
                this.noteOnPoly(key)
            } else {
                this.noteOff(key)
            } 
        } else {
            if (keydown) {
                this.noteOnMono(key)
            } else {
                if (KB.held.length) { 
                    // Last note priority
                    this.noteOnMono(KB.held[KB.held.length-1])
                } else {
                    this.noteOff(this.MONO)
                }
            }
        }
    }

    private noteOnPoly(key : number) {
        this.noteReallyOn(key)
    }

    private noteOnMono(key : number) {
        this.noteReallyOn(this.MONO)

        const keyValue = KB.scale[KB.keymap[key]]
        const src = this.sources[this.MONO]
        src.detune.value = keyValue
    }
    
    private noteReallyOn(key : number) {
        const adsr = this.ADSRs[key]

        if (adsr.releaseId >= 0) {
            clearTimeout(adsr.releaseId)
            adsr.releaseId = -1
            this.prepareSource(key)
        }
        this.startSource(key)
        ADSR_Controller.trigger(adsr.gain, this.ctx.currentTime)
    }

    private startSource(key : number) {
        const src = this.sources[key] 
        if (!src.hasStarted) {
            src.hasStarted = true
            src.start(this.ctx.currentTime, 0)
        }
    }
    
    private noteOff(key : number) {
        ADSR_Controller.untrigger(this, key)
    }

    createSource() : AudioBufferSourceNode | OscillatorNode {
        throw 'Must be implemented in the "concrete" classes.'
    }

    prepareSource(key : number) {

        this.sources[key] && this.sources[key].disconnect()
        const src = this.sources[key] = this.createSource()

        if (key !== this.MONO) {
            src.detune.value = KB.scale[KB.keymap[key]]
        }
        
        this.ADSRs[key].gain.setValueAtTime(0, 0)
        src.connect(this.ADSRs[key])
    }

    


    playKeyAtTime(key : number, time : number, duration : number) {

        const src = this.createSource()
        src.detune.value = KB.scale[KB.keymap[key]]

        const adsr = this.ctx.createGain()
        adsr.gain.setValueAtTime(1.0/44.0, 0)
        adsr.connect(this.volumeNode)
        
        src.connect(adsr)
        // src.start(time)
        // src.stop(time + duration)
        ADSR_Controller.triggerSource(src, adsr.gain, time)
        ADSR_Controller.untriggerSource(src, adsr.gain, time + duration)
    }
}
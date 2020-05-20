






import { ADSR_Controller } from './adsr.js'
import { NuniSourceNode, AudioParam2 } from './nuni_source_node.js'
import { KB } from './keyboard.js'

export class OscillatorNode2 extends NuniSourceNode {
    /**
     * A wrapper around OscillatorNode that allows
     * it to be played by the keyboard.
     */

    _type : OscillatorType
    detune : AudioParam2
    frequency : AudioParam2

    constructor(ctx : AudioContext) {
        super(ctx)

        this._type = 'sine'
        this.detune = new AudioParam2(ctx)
        this.frequency = new AudioParam2(ctx)
        
        this.setKbMode('none')
    }

    set type(t : OscillatorType) {
        for (const key in this.sources) {
            this.sources[key].type = t
        } 
        this._type = t 
    }
    get type() { return this._type }

    private prepareOscillator(key : number) { // happens in refresh
        const src = this.ctx.createOscillator()
        this.ADSRs[key].gain.value = 0

        src.start(this.ctx.currentTime)
        src.connect(this.ADSRs[key])

        this.detune.src.connect(src.detune)
        this.frequency.src.connect(src.frequency)

        if (key !== this.MONO) {
            src.detune.value = KB.scale[KB.keymap[key]]
        }

        src.type = this._type
        src.frequency.value = 0
        this.sources[key] = src
    }

    protected noteReallyOn(key : number) {
        const adsr = this.ADSRs[key]

        if (adsr.releaseId >= 0) {
            clearTimeout(adsr.releaseId)
        }
        ADSR_Controller.trigger(adsr.gain, this.ctx.currentTime)
    }

    refresh() {
        for (const key in this.sources) {
            this.sources[key].disconnect()
        }
        if (this.kbMode === 'poly') {
            KB.keyCodes.forEach(key =>
                this.prepareOscillator(key))

        } else if (this.kbMode === 'mono') {
            this.prepareOscillator(this.MONO)

        } else if (this.kbMode === 'none') {
            this.prepareOscillator(this.MONO) 
            this.ADSRs[this.MONO].gain.value = 1
        }
        else throw 'How could such a thing be?'
    }
}
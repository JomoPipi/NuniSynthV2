






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

    prepareSource(key : number) { // happens in refreshconst sources = this.sources
        const sources = this.sources

        sources[key] && sources[key].disconnect()
        const src = sources[key] = this.ctx.createOscillator()
        src.frequency.setValueAtTime(0, this.ctx.currentTime)

        this.detune.src.connect(src.detune)
        this.frequency.src.connect(src.frequency)

        if (key !== this.MONO) {
            src.detune.value = KB.scale[KB.keymap[key]]
        }

        src.type = this._type
        
        this.ADSRs[key].gain.setValueAtTime(0, 0)
        src.connect(this.ADSRs[key])
    }
}
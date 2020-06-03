






import { NuniSourceNode, NuniSourceAudioParam } from './nuni_source_node.js'

export class OscillatorNode2 extends NuniSourceNode {
    /**
     * A wrapper around OscillatorNode that allows
     * it to be played by the keyboard.
     */

    _type : OscillatorType
    detune : NuniSourceAudioParam
    frequency : NuniSourceAudioParam

    constructor(ctx : AudioContext) {
        super(ctx)

        this._type = 'sine'
        this.detune = new NuniSourceAudioParam(ctx)
        this.frequency = new NuniSourceAudioParam(ctx)
        
        this.kbMode = 'none'
    }

    set type(t : OscillatorType) {
        for (const key in this.sources) {
            this.sources[key].type = t
        } 
        this._type = t 
    }
    get type() { return this._type }

    createSource() {
        const src = this.ctx.createOscillator()

        src.frequency.setValueAtTime(0, this.ctx.currentTime)
        this.detune.src.connect(src.detune)
        this.frequency.src.connect(src.frequency)
        src.type = this._type

        return src
    }
}
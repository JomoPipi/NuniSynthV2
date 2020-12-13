






import { NuniSourceNode } from '../../note_in/nuni_source_node.js'

export class OscillatorNode2 extends NuniSourceNode
    implements AudioNodeInterfaces<NodeTypes.OSC>  {
    /**
     * A wrapper around OscillatorNode that allows
     * it to be played by the keyboard.
     */

    _type : OscillatorType
    detune : NuniAudioParam
    frequency : NuniAudioParam
    soloSource? : OscillatorNode
    customWave : PeriodicWave

    constructor(ctx : AudioContext) {
        super(ctx)

        this._type = 'sine'
        this.detune = new NuniAudioParam(ctx)
        this.frequency = new NuniAudioParam(ctx)
        
        this.kbMode = false
        this.customWave = ctx.createPeriodicWave(
            new Float32Array([0, 1, 0, 0]),
            new Float32Array([0, 1, 0, 0]))
    }

    setPeriodicWave(createWave : (ctx : AudioContext) => PeriodicWave) {
        this.customWave = createWave(this.ctx)
        this.type = 'custom' // Trigger the setter
    }

    set type(t : OscillatorType) {
        if (this.soloSource)
        {
            if (t === 'custom')
            {
                this.soloSource.setPeriodicWave(this.customWave)
            }
            else 
            {
                this.soloSource.type = t
            }
        }
        this._type = t 
    }
    get type() { return this._type }

    createSource() {
        const src = this.ctx.createOscillator()

        src.frequency.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.frequency.connect(src.frequency)
        
        if (this._type === 'custom')
        {
            src.setPeriodicWave(this.customWave)
        }
        else
        {
            src.type = this._type
        }

        return src
    }
}
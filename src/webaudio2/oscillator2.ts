






class OscillatorNode2 extends NuniSourceNode {
    /**
     * A wrapper around OscillatorNode that allows
     *  it to be compatible with the keyboard
     */

    _type : OscillatorType
    detune : AudioParam2
    frequency : AudioParam2

    constructor(ctx : AudioContext2) {
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
        const keyValue = key === this.MONO ? 0 : Keyboard.scale[Keyboard.keymap[key]]
        this.ADSRs[key].gain.value = 0

        src.start(this.ctx.currentTime)
        src.connect(this.ADSRs[key])

        this.detune.src.connect(src.detune)
        this.frequency.src.connect(src.frequency)

        src.detune.value = keyValue
        src.type = this._type
        src.frequency.value = 0
        this.sources[key] = src
    }

    protected noteOnPoly(key : number) {
        const adsr = this.ADSRs[key]
        if (adsr.releaseId >= 0) {
            clearInterval(adsr.releaseId)
        }
        if (this.sources[key].isOn) return;
        this.sources[key].isOn = true
        ADSR.trigger(adsr.gain, this.ctx.currentTime)
    }
    
    protected noteOnMono(key : number) {
        const src = this.sources[this.MONO]
        const adsr = this.ADSRs[this.MONO]
        if (adsr.releaseId >= 0 || this.lastMonoKeyPressed !== key) {
            clearInterval(adsr.releaseId)
        }
        this.lastMonoKeyPressed = key
        const keyValue = Keyboard.scale[Keyboard.keymap[key]]
        src.detune.value = keyValue
        if (src.isOn) return;
        src.isOn = true 
        ADSR.trigger(adsr.gain, this.ctx.currentTime)
    } 

    refresh() {
        for (const key in this.sources) {
            this.sources[key].disconnect()
        }
        if (this.kbMode === 'poly') {
            Keyboard.keys.forEach(key =>
                this.prepareOscillator(key))

        } else if (this.kbMode === 'mono') {
            this.prepareOscillator(this.MONO)

        } else { // this.kbMode === 'none'
            this.prepareOscillator(this.MONO) 
            this.ADSRs[this.MONO].gain.value = 1
        }
    }
}
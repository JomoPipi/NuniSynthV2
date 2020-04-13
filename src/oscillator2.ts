class OscillatorNode2 extends NuniSourceNode {
    detune:AudioParam2
    frequency:AudioParam2
    type: OscillatorType

    constructor(ctx:AudioContext2) {
        super(ctx)

        this.type = 'sine'
        this.detune = new AudioParam2(ctx)
        this.frequency = new AudioParam2(ctx)
        
        this.setKbMode('none')
    }

    setType(t : OscillatorType) {
        for (const key in this.sources) {
            this.sources[key].type = t
        } 
        this.type = t 
    }

    private prepareOscillator(key : number) {
        const src = this.ctx.createOscillator()
        const i = keymap[key] ?? 12

        src.type = this.type
        src.frequency.value = 0
        src.detune.value = (i-12) * 100 
        src.start(this.ctx.currentTime)
        src.connect(this.ADSRs[key])
        this.detune.src.connect(src.detune)
        this.frequency.src.connect(src.frequency)

        this.sources[key] = src
    }

    private noteOnPoly(key : number) {
        if (this.sources[key].lastReleaseId >= 0) {
            clearInterval(this.sources[key].lastReleaseId)
        }
        if (this.sources[key].isOn) return;
        this.sources[key].isOn = true
        ADSR.trigger(this.ADSRs[key].gain, this.ctx.currentTime)
    }
    
    private noteOnMono(key : number) {
        const _k = this.MONO
        if (this.sources[_k].lastReleaseId >= 0 || this.lastMonoKeyPressed !== key) {
            clearInterval(this.sources[_k].lastReleaseId)
        }
        this.lastMonoKeyPressed = key
        this.sources[_k].detune.value = (keymap[key]-12) * 100
        if (this.sources[_k].isOn) return;
        this.sources[_k].isOn = true 
        ADSR.trigger(this.ADSRs[_k].gain, this.ctx.currentTime)
    } 

    private noteOff(key : number) {
        if (this.sources[key].isOn) {
            this.sources[key].isOn = false
            ADSR.untrigger(this, key)
        }
    } 

    update(keydown : boolean, key : number) {
        if (this.kbMode === 'poly') {
            keydown ? 
                this.noteOnPoly(key) : 
                this.noteOff(key)
        } else {
            heldKeyArray.length > 0 ? 
                this.noteOnMono(heldKeyArray[heldKeyArray.length-1]) :
                this.noteOff(this.MONO)
        }
    }

    refresh() {
        for (const key in this.sources) {
            this.sources[key].disconnect()
        }
        if (this.kbMode === 'poly') {
            keys.forEach(key => 
                this.prepareOscillator(key))

        } else if (this.kbMode === 'mono') {
            this.prepareOscillator(this.MONO)

        } else { // this.kbMode === 'none'
            this.prepareOscillator(this.MONO) 
            this.ADSRs[this.MONO].gain.value = 1
        }
    }

}

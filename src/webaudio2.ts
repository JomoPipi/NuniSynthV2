






class AudioParam2 {
    /** AudioParams that are compatible with NuniSourceNodes
     */
    src: ConstantSourceNode

    constructor(ctx : AudioContext) {
        this.src = ctx.createConstantSource()
        this.src.start(ctx.currentTime)
    }
    
    setValueAtTime(value : number, time : never) {
        this.src.offset.value = value
    }
    // implement the rest of the value changing methods if aux-AD or glide is desired
}








class NuniSourceNode {
    /** Parent interface for Sampler and Oscillator nodes
     *  Allows for 3 keyboard modes - none | mono | poly
     */
    connectees: Destination[] // The list of things that the node connects to
    ADSRs: Indexed<Adsr>      // The gain-ADSRs
    sources: Indexible        // The AudioScheduledSourceNode containers
    kbMode: KbMode            // The current state of the node - none | mono | poly
    ctx: AudioContext2        // The context of audio
    readonly MONO: 666420     // The Id of the mono ADSR and source
    lastMonoKeyPressed: number 
    
    constructor(ctx: AudioContext2){
        this.MONO = 666420
        this.ctx = ctx
        this.kbMode = 'poly'
        this.connectees = []
        this.sources = {}
        this.ADSRs = {}
        this.lastMonoKeyPressed = -1
    }

    connect(destination : Destination) {
        this.connectees.push(destination)

        this.connection(true, destination)
        this.refresh()
    }

    disconnect(destination : Destination) {
        this.connectees.splice(
            this.connectees.indexOf(destination), 1)

        this.connection(false, destination)
        this.refresh()
    }
    
    update(keydown : boolean, key : number) {
        if (this.kbMode === 'poly') {
            keydown ? 
                this.noteOnPoly(key) : 
                this.noteOff(key)
        } else {
            const held = Keyboard.held
            held.length > 0 ? 
                this.noteOnMono(held[held.length-1]) :
                this.noteOff(this.MONO)
        }
    }

    protected setKbMode(mode : KbMode) {
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

    protected noteOff(key : number) {
        if (this.sources[key].isOn) {
            this.sources[key].isOn = false
            ADSR.untrigger(this, key)
        }
    }

    protected refresh() {
        throw 'Must be implemented in the "concrete" classes.'
    }

    protected noteOnMono(key : number) {
        throw 'Must be implemented in the "concrete" classes.'
    }
    
    protected noteOnPoly(key : number) {
        throw 'Must be implemented in the "concrete" classes.'
    }

    private connection(on : boolean, d : Destination) {
        for (const key in this.ADSRs) {
            const dest = d instanceof AudioParam2 ? d.src.offset : d as any
            if (on) {
                this.ADSRs[key].connect(dest) 
            } else {
                this.ADSRs[key].disconnect(dest)
            }
        }
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
        this.ADSRs = Keyboard.keys.reduce((adsr,key) => {
            adsr[key] = new Adsr(this.ctx)
            return adsr
        }, {} as Indexed<Adsr>)
        
        this.refresh()
    }

    private reconnectAllConnectees() {
        this.connectees.forEach(c => {
            this.connection(true, c)
            })
    }

    private disconnectAllConnectees() {
        for (const key in this.ADSRs) {
            this.sources[key].disconnect()
            this.ADSRs[key].disconnect()
            delete this.sources[key]
            delete this.ADSRs[key]
        }
    }
}








class AudioContext2 extends AudioContext {
    /** con·text    /ˈkäntekst/ 
     *  noun
     *      "the circumstances that form the setting for an event, 
     *      statement, or idea, and in terms of which it can be 
     *      fully understood and assessed."
     */
    constructor() {
        super()
    }

    createSampler() {
        return new SamplerNode(this)
    }

    createOscillator2() {
        return new OscillatorNode2(this) 
    }
}
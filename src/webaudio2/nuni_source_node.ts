






class AudioParam2 {
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








class NuniSourceNode {
    /** Parent interface for Sampler and Oscillator nodes
     *  Allows for 3 keyboard modes - none | mono | poly
     */
    connectees : Destination[] // The list of things that the node connects to
    ADSRs : Indexable<Adsr>    // The gain-ADSRs
    sources : Indexed          // The AudioScheduledSourceNode containers
    kbMode : NodeKbMode        // The current state of the node - none | mono | poly
    ctx : AudioContext2        // The context of audio
    readonly MONO : 666420     // The Id of the mono ADSR and source
    
    constructor(ctx : AudioContext2){
        this.MONO = 666420
        this.ctx = ctx
        this.kbMode = 'poly'
        this.connectees = []
        this.sources = {}
        this.ADSRs = {}
    }

    connect(destination : Destination) {
        this.connectees.push(destination)
        this.connection(true, destination)
        this.refresh()
    }

    disconnect(destination? : Destination) {
        if (!destination) {
            this.connectees.length = 0
            for (const key in this.ADSRs) {
                this.ADSRs[key].disconnect()
            }
            return;
        }
        this.connectees.splice(
            this.connectees.indexOf(destination), 1)

        this.connection(false, destination)
        this.refresh()
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

    protected noteOff(key : number) {
        ADSR_Controller.untrigger(this, key)
    }

    refresh() {
        throw 'Must be implemented in the "concrete" classes.'
    }

    protected noteReallyOn(key : number) {
        throw 'Must be implemented in the "concrete" classes.'
    }

    protected noteOnPoly(key : number) {
        this.noteReallyOn(key)
    }
    
    protected noteOnMono(key : number) {
        this.noteReallyOn(this.MONO)

        const keyValue = KB.scale[KB.keymap[key]]
        const src = this.sources[this.MONO]
        src.detune.value = keyValue
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
        this.connectees.forEach(c => {
            this.connection(true, c)
        })
    }

    private disconnectAllConnectees() {
        for (const key in this.ADSRs) {
            
            this.sources[key].disconnect()
            this.ADSRs[key].disconnect()
            clearInterval(this.ADSRs[key].releaseId)
        }
        this.sources = {}
        this.ADSRs = {}
    }
}
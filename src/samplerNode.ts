
class SamplerNode extends NuniSourceNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     * We also have the 3 keyboard modes to deal with - none | mono | poly
     */

    playbackRate: AudioParam2
    detune: AudioParam2
    bufferIndex: number
    loop: boolean
    lastMonoKeyPressed: number 
    
    constructor(ctx : AudioContext2) {
        super(ctx)

        this.bufferIndex = 0
        this.loop = true
        this.detune = new AudioParam2(ctx)
        this.playbackRate = new AudioParam2(ctx)
        this.ctx = ctx
        this.lastMonoKeyPressed = -1

        this.setKbMode('poly')
    }




    switchToNone() {
        this.ADSRs[this.MONO] = new Adsr(this.ctx)
        this.ADSRs[this.MONO].gain.setValueAtTime(1,this.ctx.currentTime)
        this.sources = {}
        this.refresh()
    }
    
    switchToMono() {
        this.ADSRs[this.MONO] = new Adsr(this.ctx)
        this.sources = {}
        this.refresh()
    }

    switchToPoly() {
        this.ADSRs = keys.reduce((adsr,key) => {
            adsr[key] = new Adsr(this.ctx)
            return adsr
        }, {} as Indexible)
        
        this.refresh()
    }

    setKbMode(mode : KbMode) {
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

    prepareBuffer(key : number) {
        const sources = this.sources
        const i = keymap[key] ?? 12 // if key is this.MONO, we want detune to be 0

        sources[key] && sources[key].disconnect()
        sources[key] = this.ctx.createBufferSource()

        sources[key].detune.value = (i-12) * 100
        this.playbackRate.src.connect(sources[key].playbackRate)
        this.detune.src.connect(sources[key].detune)

        sources[key].buffer = BUFFERS[this.bufferIndex]
        sources[key].loop = this.loop
        sources[key].lastReleaseId = -1  
        sources[key].connect(this.ADSRs[key]) ////
    }

    connectBuffer(key:number) {
        const src = this.sources[key] 
        src.start(this.ctx.currentTime)
            
        src.isOn = true
    }
    
    noteOnPoly(key : number) {
        if (this.sources[key].lastReleaseId >= 0) {
            clearInterval(this.sources[key].lastReleaseId)
            this.prepareBuffer(key)
        }
        if (this.sources[key].isOn) return;
        ADSR.trigger(this.ADSRs[key].gain, this.ctx.currentTime)
        this.connectBuffer(key)
    }
    
    noteOffPoly(key : number) {
        if (this.sources[key].isOn) {
            ADSR.untrigger(this, key)
        }
    }

    noteOnMono(key : number) {
        const _k = this.MONO
        if (this.sources[_k].lastReleaseId >= 0 || this.lastMonoKeyPressed !== key) {
            clearInterval(this.sources[_k].lastReleaseId)
            this.prepareBuffer(_k)
        }
        this.lastMonoKeyPressed = key
        this.sources[_k].detune.value = (keymap[key]-12) * 100
        if (this.sources[_k].isOn) return;
        ADSR.trigger(this.ADSRs[_k].gain, this.ctx.currentTime)
        this.connectBuffer(_k)
    }
    
    noteOffMono() {
        if (this.sources[this.MONO].isOn) { 
            ADSR.untrigger(this, this.MONO)
        }
    }

    monoUpdate() {
        if (!heldKeyArray.length) {
            this.noteOffMono()
        } else {
            this.noteOnMono(heldKeyArray[heldKeyArray.length-1])
        }
    }

    update(keydown : boolean, key : number) {
        if (this.kbMode === 'poly') {
            keydown ? this.noteOnPoly(key) : this.noteOffPoly(key)
        } else {
            this.monoUpdate()
        }
    }

    refresh() {
        if (this.kbMode === 'poly') {
            keys.forEach(key => 
                this.prepareBuffer(key))
        } else if (this.kbMode === 'mono') {
            this.prepareBuffer(this.MONO)
        } else {
            this.prepareBuffer(this.MONO) 
            this.connectBuffer(this.MONO)
        }
    }
}









class BufferNode2 extends NuniSourceNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     */

    loop : boolean
    bufferIndex : number
    detune : AudioParam2
    playbackRate : AudioParam2
    
    constructor(ctx : AudioContext2) {
        super(ctx)

        this.loop = true
        this.bufferIndex = 0
        this.detune = new AudioParam2(ctx)
        this.playbackRate = new AudioParam2(ctx)

        this.setKbMode('none')
    }

    prepareBuffer(key : number) { // happens at noteOff
        const sources = this.sources
        const keyValue = key === this.MONO ? 0 : KB.scale[KB.keymap[key]]

        sources[key] && sources[key].disconnect()
        const src = sources[key] = this.ctx.createBufferSource()
        src.playbackRate.setValueAtTime(0,this.ctx.currentTime)

        this.detune.src.connect(src.detune)
        this.playbackRate.src.connect(src.playbackRate)

        src.detune.value = keyValue
        src.buffer = Buffers.buffers[this.bufferIndex]
        src.loop = this.loop
        
        src.connect(this.ADSRs[key])
    }

    private connectBuffer(key : number) {
        const src = this.sources[key] 
        if (!src.hasStarted) {
            src.hasStarted = true
            src.start(this.ctx.currentTime)
        }
    }
    
    protected noteOnPoly(key : number) {
        this.noteReallyOn(key)
    }
    
    protected noteOnMono(key : number) {
        const keyValue = KB.scale[KB.keymap[key]]

        this.noteReallyOn(this.MONO)

        this.sources[this.MONO].detune.value = keyValue
    }

    private noteReallyOn(key : number) {
        const adsr = this.ADSRs[key]

        if (adsr.releaseId >= 0) {
            clearInterval(adsr.releaseId)
            adsr.releaseId = -1
            this.prepareBuffer(key)
        }
        
        ADSR_Controller.trigger(adsr.gain, this.ctx.currentTime)
        this.connectBuffer(key)
    }

    refresh() {
        if (this.kbMode === 'poly') {
            KB.keyCodes.forEach(key => 
                this.prepareBuffer(key))

        } else if (this.kbMode === 'mono') {
            this.prepareBuffer(this.MONO)

        } else { // this.kbMode === 'none'
            this.prepareBuffer(this.MONO) 
            this.connectBuffer(this.MONO)
        }
    }
}
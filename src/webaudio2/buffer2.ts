






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
        const i = key === this.MONO ? 12 : Keyboard.keymap[key]

        sources[key] && sources[key].disconnect()
        const src = sources[key] = this.ctx.createBufferSource()

        this.detune.src.connect(src.detune)
        this.playbackRate.src.connect(src.playbackRate)

        src.detune.value = (i-12) * 100
        src.buffer = Buffers.buffers[this.bufferIndex]
        src.loop = this.loop
        this.ADSRs[key].releaseId = -1  
        src.connect(this.ADSRs[key])
    }

    private connectBuffer(key : number) {
        const src = this.sources[key] 
        src.start(this.ctx.currentTime)
            
        src.isOn = true
    }
    
    protected noteOnPoly(key : number) {
        const adsr = this.ADSRs[key]
        if (adsr.releaseId >= 0) {
            clearInterval(adsr.releaseId)
            this.prepareBuffer(key)
        }
        if (this.sources[key].isOn) return;
        ADSR.trigger(adsr.gain, this.ctx.currentTime)
        this.connectBuffer(key)
    }
    
    protected noteOnMono(key : number) {
        const _k = this.MONO
        const adsr = this.ADSRs[_k]
        if (adsr.releaseId >= 0 || this.lastMonoKeyPressed !== key) {
            clearInterval(adsr.releaseId)
            this.prepareBuffer(_k)
        }
        this.lastMonoKeyPressed = key
        this.sources[_k].detune.value = (Keyboard.keymap[key]-12) * 100
        if (this.sources[_k].isOn) return;
        ADSR.trigger(adsr.gain, this.ctx.currentTime)
        this.connectBuffer(_k)
    }

    refresh() {
        if (this.kbMode === 'poly') {
            Keyboard.keys.forEach(key => 
                this.prepareBuffer(key))

        } else if (this.kbMode === 'mono') {
            this.prepareBuffer(this.MONO)

        } else { // this.kbMode === 'none'
            this.prepareBuffer(this.MONO) 
            this.connectBuffer(this.MONO)
        }
    }
}


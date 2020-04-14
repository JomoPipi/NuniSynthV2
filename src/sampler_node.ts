
class SamplerNode extends NuniSourceNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     * We also have the 3 keyboard modes to deal with - none | mono | poly
     */

    bufferIndex: number
    loop: boolean
    detune: AudioParam2
    playbackRate: AudioParam2
    
    constructor(ctx : AudioContext2) {
        super(ctx)

        this.bufferIndex = 0
        this.loop = true
        this.detune = new AudioParam2(ctx)
        this.playbackRate = new AudioParam2(ctx)

        this.setKbMode('none')
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

    private connectBuffer(key:number) {
        const src = this.sources[key] 
        src.start(this.ctx.currentTime)
            
        src.isOn = true
    }
    
    private noteOnPoly(key : number) {
        if (this.sources[key].lastReleaseId >= 0) {
            clearInterval(this.sources[key].lastReleaseId)
            this.prepareBuffer(key)
        }
        if (this.sources[key].isOn) return;
        ADSR.trigger(this.ADSRs[key].gain, this.ctx.currentTime)
        this.connectBuffer(key)
    }
    
    private noteOnMono(key : number) {
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

    private noteOff(key : number) {
        if (this.sources[key].isOn) {
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
        if (this.kbMode === 'poly') {
            keys.forEach(key => 
                this.prepareBuffer(key))

        } else if (this.kbMode === 'mono') {
            this.prepareBuffer(this.MONO)

        } else { // this.kbMode === 'none'
            this.prepareBuffer(this.MONO) 
            this.connectBuffer(this.MONO)
        }
    }
}


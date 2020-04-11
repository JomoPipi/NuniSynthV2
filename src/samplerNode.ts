



const keys = ([] as number[]).concat(...[
    '1234567890',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
    ].map((s,i) => 
        [...s].map(c=>c.toUpperCase().charCodeAt(0))
            .concat([
                [189,187],
                [219,221],
                [186,222],
                [188,190,191]
            ][i]) // won't work on FireFox. should I care?
        ))

const keyset = new Set(keys)




// class SamplerNodeAudioParam {
//     /**
//      * AudioParams that are compatible with the sampler
//      */
//     src: ConstantSourceNode

//     constructor(name: string, ctx: AudioContext) {
//         this.src = ctx.createConstantSource()
//         this.src.start(ctx.currentTime)
//     }
    
//     setValueAtTime(value: number, time:never) {
//         this.src.offset.value = value - 1
//     }
// }




class SamplerNode {//extends NuniSourceNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     */

    // connectees: Destination[]
    playbackRate: AudioParam2
    detune: AudioParam2
    sources: Indexible
    bufferIndex: number
    loop: boolean
    active: boolean
    ctx: AudioContext2
    ADSRs: { [key:number] : GainNode }
    
    constructor(ctx : AudioContext2) {
        // super(NodeTypes.SAMPLER, ctx)
        
        this.bufferIndex = 0
        this.loop = true
        this.active = true
        this.detune = new AudioParam2(ctx)
        this.playbackRate = new AudioParam2(ctx)
        this.ctx = ctx
                
        this.ADSRs = keys.reduce((a,key) => {
            a[key] = ctx.createGain()  
            return a
        }, {} as Indexible)
        
        this.sources = keys.reduce((sources,key,i) => {
            const src = ctx.createBufferSource()
            src.detune.value = (i-12) * 100
            this.detune.src.connect(src.detune)
            this.playbackRate.src.connect(src.playbackRate)
            sources[key] = src
            return sources
        }, {} as any)
        
        this.refresh()
    }

    prepareBuffer(key : number) {
        const sources = this.sources
        const oldDetune = sources[key].detune.value
        
        sources[key].disconnect()
        sources[key] = this.ctx.createBufferSource()
        sources[key].detune.value = oldDetune

        this.playbackRate.src.connect(sources[key].playbackRate)
        this.detune.src.connect(sources[key].detune)

        sources[key].buffer = BUFFERS[this.bufferIndex]
        sources[key].loop = this.loop
        sources[key].lastReleaseId = -1

        sources[key].connect(this.ADSRs[key]) ////

        // this.connectees.forEach(destination =>  
        //     sources[key].connect(destination))
    }

    connectBuffer(_:any, key:number) {
        const src = this.sources[key] 
        src.start(this.ctx.currentTime)
            
        src.isOn = true
    }

    connect(destination : Destination) {
        // this.connectees.push(destination)

        for (const key in this.ADSRs) {
            if (destination instanceof AudioParam2) {
                this.ADSRs[key].connect(destination.src.offset)
            } else {
                this.ADSRs[key].connect(destination as any)
            }
        }
        this.refresh()
    }

    disconnect(destination : Destination) {
        // this.connectees.splice(
        //     this.connectees.indexOf(destination), 1)

        for (const key in this.ADSRs) {
            if (destination instanceof AudioParam2) {
                this.ADSRs[key].disconnect(destination.src.offset)
            } else {
                this.ADSRs[key].disconnect(destination as any)
            }
        }
        this.refresh()
    }

    noteOn(key : number) {
        if (this.sources[key].lastReleaseId >= 0) {
            clearInterval(this.sources[key].lastReleaseId)
            this.prepareBuffer(key)
        }
        if (this.sources[key].isOn) return;
        ADSR.trigger(this.ADSRs[key].gain, this.ctx.currentTime)
        this.connectBuffer(0,key)
    }
    
    noteOff(key : number) {
        if (this.sources[key].isOn) {
            ADSR.untrigger(this, key)
        }
    }

    update(keydown : boolean, key : number) {
        keydown ? this.noteOn(key) : this.noteOff(key)
    }

    refresh() {
        keys.forEach((key) => 
            this.prepareBuffer(key))
    }
}






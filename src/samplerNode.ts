
const samplerBuffers : AudioBuffer[] = []

function initBuffers(n : number, ctx : AudioContext2) {
    samplerBuffers.length = 0
    for (let x = 0; x < n; x++) {
        const buffer = ctx.createBuffer(2, ctx.sampleRate * 3, ctx.sampleRate)
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {  
            const nowBuffering = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                nowBuffering[i] = [
                    Math.sin(i / 32.0) * 0.75 + Math.sin(i / 128.0 * channel) * 0.5 + Math.cos(i / (1000/(i**0.9*9+1))) * 0.3,
                    Math.sin(i / 32.0 + Math.sin(i / (channel+1))),
                    Math.sin(i / Math.tan(i/3.0)),
                    Math.sin(i / Math.tan(i/3.0)) - Math.cos(i / 32.0),
                    
                    Math.sin(i / Math.sqrt(i/3.0)) - Math.cos(i ** 0.3),
                    Math.sin(i / Math.sqrt(i/3.0)) * Math.cos(i ** 0.3),
                    (Math.sin(i / Math.sqrt(i/3.0))+1) ** Math.cos(i ** 0.3),
                    Math.cos(i / Math.sqrt(i/3.0)) ** (Math.cos(i ** 0.3)/2.0+0.25),
                    Math.cos(i / Math.sqrt(i/30.0)) ** (Math.cos(i ** 0.03)),
                    Math.sin(i / 32.0) + Math.sin(i / 512.0),
                ][x]
                    // lots of cool things can be done, here.
            }
        }
        samplerBuffers.push(buffer)
    }
}




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




class SamplerNodeAudioParam {
    /**
     * AudioParams that are compatible with the sampler
     */
    src: ConstantSourceNode

    constructor(name: string, ctx: AudioContext) {
        this.src = ctx.createConstantSource()
        this.src.start(ctx.currentTime)
    }
    
    setValueAtTime(value: number, time:never) {
        this.src.offset.value = value - 1
    }
}




class SamplerNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     */

    // connectees: Destination[]
    playbackRate: SamplerNodeAudioParam
    detune: SamplerNodeAudioParam
    sources: Indexible
    bufferIndex: number
    loop: boolean
    active: boolean
    ctx: AudioContext2
    ADSRs: { [key:number] : GainNode }
    
    constructor(ctx : AudioContext2) {
        // this.connectees = []
        this.bufferIndex = 0
        this.loop = true
        this.active = true
        this.detune = new SamplerNodeAudioParam('detune', ctx)
        this.playbackRate = new SamplerNodeAudioParam('playbackRate', ctx)
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

        sources[key].buffer = samplerBuffers[this.bufferIndex]
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
            if (destination instanceof SamplerNodeAudioParam) {
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
            if (destination instanceof SamplerNodeAudioParam) {
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






// class Sampler {
//     /** just hosts a mono node that loops forever */

//     // connectees: Destination[]
//     sources: Indexible
//     bufferIndex: number
//     loop: boolean
//     ctx: AudioContext2
//     ADSRs: GainNode
    
//     constructor(ctx : AudioContext2) {
//         // this.connectees = []
//         this.bufferIndex = 0
//         this.loop = true
//         this.active = true
//         this.detune = new SamplerNodeAudioParam('detune', ctx)
//         this.playbackRate = new SamplerNodeAudioParam('playbackRate', ctx)
//         this.ctx = ctx
                
//         this.ADSRs = keys.reduce((a,key) => {
//             a[key] = ctx.createGain()  
//             return a
//         }, {} as Indexible)
        
//         this.sources = keys.reduce((sources,key,i) => {
//             const src = ctx.createBufferSource()
//             src.detune.value = (i-12) * 100
//             this.detune.src.connect(src.detune)
//             this.playbackRate.src.connect(src.playbackRate)
//             sources[key] = src
//             return sources
//         }, {} as any)
        
//         this.refresh()
//     }

//     prepareBuffer(key : number) {
//         const sources = this.sources
//         const oldDetune = sources[key].detune.value
        
//         sources[key].disconnect()
//         sources[key] = this.ctx.createBufferSource()
//         sources[key].detune.value = oldDetune

//         this.playbackRate.src.connect(sources[key].playbackRate)
//         this.detune.src.connect(sources[key].detune)

//         sources[key].buffer = samplerBuffers[this.bufferIndex]
//         sources[key].loop = this.loop
//         sources[key].lastReleaseId = -1

//         sources[key].connect(this.ADSRs[key]) ////

//         // this.connectees.forEach(destination =>  
//         //     sources[key].connect(destination))
//     }

//     connectBuffer(_:any, key:number) {
//         const src = this.sources[key] 
//         src.start(this.ctx.currentTime)
            
//         src.isOn = true
//     }

//     connect(destination : Destination) {
//         // this.connectees.push(destination)

//         for (const key in this.ADSRs) {
//             if (destination instanceof SamplerNodeAudioParam) {
//                 this.ADSRs[key].connect(destination.src.offset)
//             } else {
//                 this.ADSRs[key].connect(destination as any)
//             }
//         }
//         this.refresh()
//     }

//     disconnect(destination : Destination) {
//         // this.connectees.splice(
//         //     this.connectees.indexOf(destination), 1)

//         for (const key in this.ADSRs) {
//             if (destination instanceof SamplerNodeAudioParam) {
//                 this.ADSRs[key].disconnect(destination.src.offset)
//             } else {
//                 this.ADSRs[key].disconnect(destination as any)
//             }
//         }
//         this.refresh()
//     }

//     noteOn(key : number) {
//         if (this.sources[key].lastReleaseId >= 0) {
//             clearInterval(this.sources[key].lastReleaseId)
//             this.prepareBuffer(key)
//         }
//         if (this.sources[key].isOn) return;
//         ADSR.trigger(this.ADSRs[key].gain, this.ctx.currentTime)
//         this.connectBuffer(0,key)
//     }
    
//     noteOff(key : number) {
//         if (this.sources[key].isOn) {
//             ADSR.untrigger(this, key)
//         }
//     }

//     update(keydown : boolean, key : number) {
//         keydown ? this.noteOn(key) : this.noteOff(key)
//     }

//     refresh() {
//         keys.forEach((key) => 
//             this.prepareBuffer(key))
//     }
// }
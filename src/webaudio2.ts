

type KbMode = 'none' | 'mono' | 'poly'


class AudioParam2 {
    /**
     * AudioParams that are compatible with the keyboard
     */
    src: ConstantSourceNode

    constructor(ctx: AudioContext) {
        this.src = ctx.createConstantSource()
        this.src.start(ctx.currentTime)
    }
    
    setValueAtTime(value: number, time:never) {
        this.src.offset.value = value
    }
}

// class NuniSourceNode {
//     /** Parent interface for Sampler nodes and Oscillator nodes
//      * 
//      */
//     _kbMode: KbMode
//     // sources: { [key:number]: /AudioBufferSourceNode | OscillatorNode }
//     ctx: AudioContext2
//     sources: Indexible
//     params: Indexed<AudioParam2>
//     ADSRs: Indexed<GainNode>

//     constructor(type: NodeTypes.OSC | NodeTypes.SAMPLER, ctx: AudioContext2) {
//         this._kbMode = 'none'
//         this.ctx = ctx
//         this.sources = {}
//         this.ctx = ctx
//         this.ADSRs = {}

//         this.params = AudioNodeParams[type].reduce((a,param) => {
//             a[param] = new AudioParam2(ctx)
//             return a
//         }, {} as Indexed<AudioParam2>)
                
//     }
//     setUpNone() {
        
//     }

//     setUpPoly() {
//         this.ADSRs = keys.reduce((a,key) => {
//             a[key] = this.ctx.createGain()  
//             return a
//         }, {} as Indexed<GainNode>)
//     }

//     set kBMode(mode : KbMode) {
//         if (mode === 'none') {
//             this.setUpNone()
//         } else if (mode === 'mono') {
//             this.setUpMono()
//         } else if (mode === 'poly') {
//             this.setUpPoly()
//         }
//     }

//     get kbMode() {
//         return this._kbMode
//     }

    
//     // noteOn(key : number) {
//     //     if (this.sources[key].lastReleaseId >= 0) {
//     //         clearInterval(this.sources[key].lastReleaseId)
//     //         this.prepareBuffer(key)
//     //     }
//     //     if (this.sources[key].isOn) return;
//     //     ADSR.trigger(this.ADSRs[key].gain, this.ctx.currentTime)
//     //     this.connectBuffer(0,key)
//     // }
    
//     // noteOff(key : number) {
//     //     if (this.sources[key].isOn) {
//     //         ADSR.untrigger(this, key)
//     //     }
//     // }
// }








// class OscillatorNode2 {
//     kbConnection: KbMode
//     detune:AudioParam2
//     frequency:AudioParam2
//     ctx:AudioContext2
//     ADSRs: Indexed<GainNode>
//     sources: Indexed<OscillatorNode>

//     constructor(ctx:AudioContext2) {
//         this.kbConnection = 'none'
//         this.detune = new AudioParam2(ctx)
//         this.frequency = new AudioParam2(ctx)
//         this.ctx = ctx
                
//         this.ADSRs = keys.reduce((a,key) => {
//             a[key] = ctx.createGain()  
//             return a
//         }, {} as Indexible)
        
//         this.sources = keys.reduce((sources,key,i) => {
//             const src = ctx.createOscillator()
//             src.detune.value = (i-12) * 100
//             this.detune.src.connect(src.detune)
//             this.frequency.src.connect(src.frequency)
//             sources[key] = src
//             return sources
//         }, {} as Indexible)
        
//         this.refresh()
//     }

//     refresh() {
//         // if ()
//     }

    
// }

class AudioContext2 extends AudioContext {

    constructor() {
        super()
    }

    createSampler() {
        return new SamplerNode(this)
    }

    createOscillator2() {
        return this.createOscillator() // new OscillatorNode2(this)
    }
}
const keys = ([] as number[]).concat(...[
    '1234567890',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
    ].map((s,i) => 
        [...s].map(c=>c.toUpperCase().charCodeAt(0))
            .concat([ // add the [];',./ (aka {}:"<>?) keys
                [189,187],
                [219,221],
                [186,222],
                [188,190,191]
            ][i]) // won't work on FireFox. should I care?
        ))

const keyset = new Set(keys)
const keymap = keys.reduce((map,key,i) => {
    map[key] = i
    return map
}, {} as Indexed<number>)
const heldKeyArray = [] as number[]




type KbMode = 'none' | 'mono' | 'poly'




class Adsr extends GainNode {
    /**
     * The only purpose of this class right now is 
     * to add the property lastReleastId to GainNodes.
     */
    lastReleaseId: number
    constructor(ctx: AudioContext2) {
        super(ctx)
        this.lastReleaseId = -1
    }
}




class AudioParam2 {
    /** AudioParams that are compatible with the keyboard
     */
    src: ConstantSourceNode

    constructor(ctx: AudioContext) {
        this.src = ctx.createConstantSource()
        // this.src.offset.value = 0
        this.src.start(ctx.currentTime)
    }
    
    setValueAtTime(value: number, time:never) {
        this.src.offset.value = value
    }
    // implement the rest of the value changing methods if aux-AD is desired
}




class NuniSourceNode {
    /** Parent interface for Sampler and Oscillator nodes
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

    private switchToNone() {
        this.ADSRs[this.MONO] = new Adsr(this.ctx)
        this.ADSRs[this.MONO].gain.setValueAtTime(1,this.ctx.currentTime)
        this.sources = {}
        this.refresh()
    }
    
    private switchToMono() {
        this.ADSRs[this.MONO] = new Adsr(this.ctx)
        this.sources = {}
        this.refresh()
    }

    private switchToPoly() {
        this.ADSRs = keys.reduce((adsr,key) => {
            adsr[key] = new Adsr(this.ctx)
            return adsr
        }, {} as Indexible)
        
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

    update(keydown:boolean, key:number) {
        throw 'Must be implemented in the "concrete" classes.'
    }

    protected refresh() {
        throw 'Must be implemented in the "concrete" classes.'
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
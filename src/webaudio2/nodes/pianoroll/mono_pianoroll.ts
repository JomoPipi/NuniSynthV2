






import { MonoPianoRollControls } from "./pianoroll_controller.js"







export class MonoPianoRoll 
    implements AudioNodeInterfaces<NodeTypes.PIANOR> {

    isPlaying = true
    private ctx : AudioContext
    private csn : ConstantSourceNode
    private pianoRoll : MonoPianoRollControls

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.csn = ctx.createConstantSource()
        this.pianoRoll = new MonoPianoRollControls(this.ctx)

        for (const prop of Object.keys(Transferable_Pianoroll_properties))
        {
            Object.defineProperty(this, prop, { 
                get() {
                    return this.pianoRoll[prop]
                }, 
                set(value : any) {
                    this.pianoRoll[prop] = value
                }
            })
        }
        
        this.csn.start()
        this.play()
    }

    connect(destination : Destination) {
        this.csn.connect(destination)
    }
    
    disconnect(destination? : Destination) {
        this.csn.disconnect(destination)
    }

    getController() {
        return this.pianoRoll.controller
    }
    
    scheduleNotes() {
        this.pianoRoll.scheduleNotes()
    }

    setTempo(tempo : number) {
        this.pianoRoll.setTempo(tempo)
    }

    play() {
        this.isPlaying = true
        this.pianoRoll.play(this.ctx, ({ start, end, n }) => {
            this.csn.offset.setValueAtTime(n * 100, start)
            this.csn.offset.setValueAtTime(0, end)
        })
    }

    sync() {}

    get MMLString() {
        return this.pianoRoll.getMMLString()
    }

    set MMLString(s : string) {
        this.pianoRoll.setMMLString(s)
    }
}
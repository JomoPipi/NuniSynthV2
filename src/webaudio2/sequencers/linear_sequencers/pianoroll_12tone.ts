






import { Theme } from '../../../UI_setup/theme_setup.js'

export class PianoRoll12Tone {

    html : HTMLElement
    pianoRoll : any
    ctx
    csn

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.html = E('div')

        const util = D("utility-div")
        util.innerHTML = `
<webaudio-pianoroll
    wheelzoom=1
    editmode='dragmono'
    xscroll=1
    yscroll=1
    kbwidth=30
    colrulerbg='${Theme.colors[2]}'
    colrulerfg='${Theme.colors[5]}'
    collt='${Theme.colors[1]}'
    coldk='${Theme.colors[0]}'
></webaudio-pianoroll>`

        this.pianoRoll = util.removeChild(util.children[0])
        this.html.appendChild(this.pianoRoll)
        requestAnimationFrame(_ => this.play())
        
        this.csn = ctx.createConstantSource()
        this.csn.start()

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

    }
    connect(destination : any) {
        this.csn.connect(destination)
    }
    disconnect(destination? : any) {
        this.csn.disconnect(destination)
    }
    scheduleNotes() {
        this.pianoRoll.scheduleNotes()
    }
    setTempo(tempo : number) {
        this.pianoRoll.setTempo(tempo)
    }
    play() {
        this.pianoRoll.play(this.ctx, ({ t, g, n } : any) => {
            this.csn.offset.setValueAtTime(n * 100, t)
            this.csn.offset.setValueAtTime(0, g)
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






function setOfKeys() {
    return `<ul>
    <li class="white b"></li>
    <li class="black as"></li>
    <li class="white a"></li>
    <li class="black gs"></li>
    <li class="white g"></li>
    <li class="black fs"></li>
    <li class="white f"></li>
    <li class="white e"></li>
    <li class="black ds"></li>
    <li class="white d"></li>
    <li class="black cs"></li>
    <li class="white c"></li>
    </ul>`
}
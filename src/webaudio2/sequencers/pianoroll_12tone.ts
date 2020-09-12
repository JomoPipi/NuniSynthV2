






export class PianoRoll12Tone {

    html : HTMLElement
    private canvas : HTMLCanvasElement
    private octaves = 4

    constructor(ctx : AudioContext) {
        this.canvas = E('canvas', 
            { props: {width: 500, height: 300}})
        
        const pianorollSettings = E('span', { className: 'selected' })
        const pianoroll = E('ul', { className: 'piano-octave' })
        pianoroll.innerHTML = [...Array(1)]
            .map(setOfKeys).join('\n')

        this.html = E('div', 
            { children: [ pianorollSettings, pianoroll ]})

        this.initializePianoRollHTML(this.canvas)
    }

    initializePianoRollHTML(canvas : HTMLCanvasElement) {
        const ctx = canvas.getContext('2d')!
        
        const H = canvas.height
        const W = canvas.width

        const pianoLine = 0.05
        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.moveTo(W * pianoLine, 0)
        ctx.lineTo(W * pianoLine, H)
        ctx.stroke()

    }

    connect() {

    }
    disconnect() {

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
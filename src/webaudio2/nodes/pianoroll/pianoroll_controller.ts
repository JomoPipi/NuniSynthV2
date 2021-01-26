






type NoteEvent = { start : number, end : number, n : number }
type PlayCallback = (noteEvent : NoteEvent) => void

type Note = {
    startTime : number
    endTime : number
    n : number
    isSelected : boolean
}

const markstartsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAwLDIzIHoiLz4NCjwvc3ZnPg0K"
const cursorsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj4NCjxwYXRoIGZpbGw9InJnYmEoMjU1LDEwMCwxMDAsMC44KSIgZD0iTTAsMSAyNCwxMiAwLDIzIHoiLz4NCjwvc3ZnPg0K"
const markendsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAyNCwyMyB6Ii8+DQo8L3N2Zz4NCg=="
const keyboardsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSI0ODAiPg0KPHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBkPSJNMCwwIGgyNHY0ODBoLTI0eiIvPg0KPHBhdGggZmlsbD0iIzAwMCIgZD0iTTAsNDAgaDEydjQwaC0xMnogTTAsMTIwIGgxMnY0MGgtMTJ6IE0wLDIwMCBoMTJ2NDBoLTEyeiBNMCwzMjAgaDEydjQwaC0xMnogTTAsNDAwIGgxMnY0MGgtMTJ6Ii8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIGQ9Ik0wLDYwIGgyNCBNMCwxNDAgaDI0IE0wLDIyMCBoMjQgTTAsMjgwIGgyNCBNMCwzNDAgaDI0IE0wLDQyMCBoMjQiLz4NCjwvc3ZnPg0K"

const KB_WIDTH = 40
const RULER_WIDTH = 24
const SEMIFLAG = [6, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0]

export class MonoPianoRollControls {

    controller = E('div', { className: 'pianoroll-controller' })

    private audioCtx : AudioContext
    private body : HTMLDivElement
    private canvas : HTMLCanvasElement
    private keyboardImage : HTMLDivElement
    private markstart : HTMLImageElement
    private markend : HTMLImageElement
    private cursor : HTMLImageElement
    private ctx : CanvasRenderingContext2D
    private sequence : Note[]
    private dragging : {}
    private width = 485
    private height = 300
    private xrange = 16
    private yrange = 16

    private gridWidth = -1
    private gridHeight = -1
    private stepWidth = -1
    private stepHeight = -1

    constructor(audioCtx : AudioContext) {
        this.audioCtx = audioCtx

        this.body = E('div', { className: 'wac-body' })
        this.keyboardImage = E('div', { className: 'wac-kb' })
        this.canvas = E('canvas', { className: 'wac-pianoroll' })
        this.markstart = E('img', { className: 'marker' })
        this.markend = E('img', { className: 'marker' })
        this.cursor = E('img', { className: 'marker' })

        this.markstart.src = markstartsrc
        this.markend.src = markendsrc
        this.cursor.src = cursorsrc
        this.keyboardImage.style.background = `url("${keyboardsrc}")`

        this.body.append(this.canvas, this.keyboardImage, this.markstart, this.markend, this.cursor)
        this.controller.appendChild(this.body)

        this.ctx = this.canvas.getContext('2d')!
        this.sequence = []
        this.dragging = {}
        
        this.layout()
    }

    scheduleNotes() {}
    setTempo(tempo : number) {}
    play(playCallback : PlayCallback) {}
    getMMLString() { return '' }
    setMMLString(s : string) {}

    private layout() {
        this.canvas.width = this.width
        this.body.style.width = 
        this.canvas.style.width =
            this.width + 'px'

        this.canvas.height = this.height
        this.body.style.height = 
        this.canvas.style.height =
            this.height + 'px'

        this.gridWidth = this.width - RULER_WIDTH - KB_WIDTH
        this.gridHeight = this.height - RULER_WIDTH

        this.redraw()
    }

    private redraw() {
        let [x, w, y, x2, y2] = [0,0,0,0,0]
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.stepWidth = this.gridWidth / this.xrange
        this.stepHeight = this.gridHeight / this.yrange
        this.redrawGrid()
    }

    private redrawGrid() {
        const dark = '#444'
        const light = '#aaa'
        for (let y = 0; y < 128; ++y)
        {
            this.ctx.fillStyle = SEMIFLAG[y % 12] & 1
                ? dark
                : light
        }
    }
}
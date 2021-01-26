






type NoteEvent = { start : number, end : number, n : number }
type PlayCallback = (noteEvent : NoteEvent) => void

type Note = {
    startTime : number
    endTime : number
    n : number
    isSelected : boolean
}

const markstartsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAwLDIzIHoiLz4NCjwvc3ZnPg0K"
const playheadsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj4NCjxwYXRoIGZpbGw9InJnYmEoMjU1LDEwMCwxMDAsMC44KSIgZD0iTTAsMSAyNCwxMiAwLDIzIHoiLz4NCjwvc3ZnPg0K"
const markendsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAyNCwyMyB6Ii8+DQo8L3N2Zz4NCg=="
const keyboardsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSI0ODAiPg0KPHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBkPSJNMCwwIGgyNHY0ODBoLTI0eiIvPg0KPHBhdGggZmlsbD0iIzAwMCIgZD0iTTAsNDAgaDEydjQwaC0xMnogTTAsMTIwIGgxMnY0MGgtMTJ6IE0wLDIwMCBoMTJ2NDBoLTEyeiBNMCwzMjAgaDEydjQwaC0xMnogTTAsNDAwIGgxMnY0MGgtMTJ6Ii8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIGQ9Ik0wLDYwIGgyNCBNMCwxNDAgaDI0IE0wLDIyMCBoMjQgTTAsMjgwIGgyNCBNMCwzNDAgaDI0IE0wLDQyMCBoMjQiLz4NCjwvc3ZnPg0K"

const KB_WIDTH = 40
const RULER_WIDTH = 24
const SEMIFLAG = [6, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0]
const OCTAVE_OFFSET = -1
const TIMEBASE = 16
const X_START = RULER_WIDTH + KB_WIDTH

export class MonoPianoRollControls {

    controller = E('div', { className: 'pianoroll-controller' })

    private audioCtx : AudioContext
    private body : HTMLDivElement
    private canvas : HTMLCanvasElement
    private keyboardImage : HTMLDivElement
    private markstartImage : HTMLImageElement
    private markendImage : HTMLImageElement
    private playheadImage : HTMLImageElement
    private ctx : CanvasRenderingContext2D
    private sequence : Note[]
    private dragging : {}
    private width = 485
    private height = 300
    private xrange = 16
    private yrange = 16
    private xoffset = 0
    private yoffset = 0
    private playhead = 0
    private markstart = 0
    private markend =  16

    private gridWidth = -1
    private gridHeight = -1
    private stepWidth = -1
    private stepHeight = -1

    constructor(audioCtx : AudioContext) {
        this.audioCtx = audioCtx

        this.body = E('div', { className: 'wac-body' })
        this.keyboardImage = E('div', { className: 'wac-kb' })
        this.canvas = E('canvas', { className: 'wac-pianoroll' })
        this.markstartImage = E('img', { className: 'marker' })
        this.markendImage = E('img', { className: 'marker' })
        this.playheadImage = E('img', { className: 'marker' })

        this.markstartImage.src = markstartsrc
        this.markendImage.src = markendsrc
        this.playheadImage.src = playheadsrc
        this.keyboardImage.style.background = `url("${keyboardsrc}")`

        this.body.append(
            this.canvas, 
            this.keyboardImage, 
            this.markstartImage, 
            this.markendImage, 
            this.playheadImage)

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
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.stepWidth = this.gridWidth / this.xrange
        this.stepHeight = this.gridHeight / this.yrange
        this.redrawGrid()
        this.drawSequence()
        this.redrawYRuler()
        this.redrawXRuler()
        this.redrawMarker()
        this.redrawSelectedArea()
    }

    private redrawGrid() {
        const darkColor = '#222'
        const liteColor = '#555'
        const gridColor = '#999'

        // Horizontal Lines:
        for (let i = 0; i < 128; ++i)
        {
            this.ctx.fillStyle = SEMIFLAG[i % 12] & 1 ? darkColor : liteColor
            const y = this.height + (this.yoffset - i) * this.stepHeight | 0
            this.ctx.fillRect(X_START, y, this.gridWidth, -this.stepHeight)
            this.ctx.fillStyle = gridColor
            this.ctx.fillRect(X_START, y, this.gridWidth, 1)
        }
        // Vertical Lines:
        const grid = 4
        for (let i = 0;; i += grid)
        {
            const x = this.stepWidth * (i - this.xoffset) + X_START | 0
            this.ctx.fillRect(x, RULER_WIDTH, 1, this.gridHeight)
            if (x >= this.width) break
        }
    }

    private drawSequence() {
        for (const { startTime, endTime, isSelected, n } of this.sequence)
        {
            this.ctx.fillStyle = isSelected ? 'red' : 'green'
            this.ctx.strokeStyle = isSelected ? 'white' : 'black'
            const w = endTime * this.stepWidth
            const x = (startTime - this.xoffset) * this.stepWidth + X_START
            const x2 = x + w | 0
            const x3 = x | 0
            const y = this.height - (n - this.yoffset) * this.stepHeight
            const y2 = y - this.stepHeight | 0
            const y3 = y | 0
            this.ctx.rect(x3, y3, x2 - x3, y2 - y3)
            this.ctx.fill()
            this.ctx.stroke()
        }
    }

    private redrawYRuler() {
        const rulerColor = '#333'
        const foregroundColor = '#bbb'

        this.ctx.textAlign = 'right'
        this.ctx.font = (this.stepHeight / 2 | 0) + "px 'sans-serif'"
        this.ctx.fillStyle = rulerColor
        this.ctx.fillRect(0, RULER_WIDTH, RULER_WIDTH, this.gridHeight)

        this.ctx.fillStyle = foregroundColor
        for (let i = 0; i < 128; i += 12)
        {
            const y = this.height - this.stepHeight * (i - this.yoffset)
            this.ctx.fillRect(0, y | 0, RULER_WIDTH, -1)
            this.ctx.fillText(`C${i/12 + OCTAVE_OFFSET | 0}`, RULER_WIDTH - 4, y - 4)
        }
        const style = this.keyboardImage.style
        style.top = style.left = RULER_WIDTH + 'px'
        style.width = KB_WIDTH + 'px'
        style.backgroundSize = `100% ${this.stepHeight * 12}px`
        style.backgroundPosition = 
            `0px ${this.gridHeight + this.stepHeight * this.yoffset}px`
    }

    private redrawXRuler() {
        const rulerColor = '#333'
        const foregroundColor = '#bbb'

        this.ctx.textAlign = 'left'
        this.ctx.font = (RULER_WIDTH / 2) + "px 'sans-serif'"
        this.ctx.fillStyle = rulerColor
        this.ctx.fillRect(0, 0, this.width, RULER_WIDTH)
        this.ctx.fillStyle = foregroundColor
        for (let t = 0;; t += TIMEBASE)
        {
            const x = (t - this.xoffset) * this.stepWidth + X_START
            this.ctx.fillRect(x, 0, 1, RULER_WIDTH)
            this.ctx.fillText((t / TIMEBASE + 1).toString(), x + 4, RULER_WIDTH - 8)
            if (x >= this.width) break
        }
    }

    private redrawMarker() {
        const start = (this.markstart - this.xoffset) * this.stepWidth + X_START
        const now = (this.playhead - this.xoffset) * this.stepWidth + X_START
        const end = (this.markend - this.xoffset) * this.stepWidth + X_START
        const endOffset = -24
        this.markstartImage.style.left = start + 'px'
        this.playheadImage.style.left = now + 'px'
        this.markendImage.style.left = (end + endOffset) + 'px'
    }

    private redrawSelectedArea() {
        // if (this.dragging)
    }
}
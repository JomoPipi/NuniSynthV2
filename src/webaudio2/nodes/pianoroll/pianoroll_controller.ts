






type NoteEvent = { start : number, end : number, n : number }
type PlayCallback = (noteEvent : NoteEvent) => void

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

// Possible future class members:
const SNAP = 1

const Targets =
    { UNSELECTED_NOTE: "n"
    , NOTE_CENTER: "N"
    , NOTE_LEFT: "B"
    , NOTE_RIGHT: "E"
    , EMPTY: "s"
    , X_RULER: "x"
    , Y_RULER: "y"
    } as const

const DragModes =
    { SELECTION: "A"
    , MARKSTART: "S"
    , MARKEND: "E"
    , PLAYHEAD: "P"
    , NOTES: "D"
    , NONE: 'none'
    } as const

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
    private dragging : DragData
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

    private bindcontextmenu : MouseHandler
    private bindpointermove : MouseHandler
    private bindcancel      : MouseHandler

    private sequenceShouldBeSorted = false

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

        this.body.addEventListener("mousedown",this.pointerdown.bind(this), true)
        this.canvas.addEventListener('mousemove',this.mousemove.bind(this),false)
        // this.canvas.addEventListener('keydown',this.keydown.bind(this),false)
        // this.canvas.addEventListener('mousewheel',this.wheel.bind(this),false)

        this.bindcontextmenu = this.contextmenu.bind(this)
        this.bindpointermove = this.pointermove.bind(this)
        this.bindcancel = this.cancel.bind(this)

        this.ctx = this.canvas.getContext('2d')!
        this.sequence = []
        this.dragging = 
            { target: Targets.EMPTY
            , mode: DragModes.NONE
            , markerPosition: -1
            , p1: { x: -1, y: -1 } 
            , p2: { x: -1, y: -1 } 
            , x : -1
            , y : -1
            , i: -1
            , n: -1
            , t1: -1
            , t2: -1
            , n1: -1
            , n2: -1
            , time: -1
            , endTime: -1
            , offsetx: -1
            , offsety: -1
            , notes: []
            }
        
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
        for (const { t1, t2, isSelected, n } of this.sequence)
        {
            this.ctx.fillStyle = isSelected ? 'red' : 'green'
            this.ctx.strokeStyle = isSelected ? 'white' : 'black'
            const w = t2 * this.stepWidth
            const x = (t1 - this.xoffset) * this.stepWidth + X_START
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
        if (this.dragging.mode === DragModes.SELECTION)
        {
            const { p1, p2 } = this.dragging
            this.ctx.fillStyle = "rgba(0,0,0,0.3)"
            this.ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
        }
    }



    private pointerdown(e : MouseEvent) {
        const position = this.getPosition(e)
        const msg = this.getHoverMessage(position)
        
        window.addEventListener("mousemove", this.bindpointermove,false)
        window.addEventListener("mouseup", this.bindcancel)
        window.addEventListener("contextmenu", this.bindcontextmenu)
        
        if (e.buttons === 2 || e.ctrlKey)
        {
            this.dragging.mode = DragModes.SELECTION
            this.dragging.p1 = position
            this.dragging.p2 = position
            this.dragging.t1 = msg.time
            this.dragging.n1 = msg.n
            e.preventDefault()
            e.stopPropagation()
            this.canvas.focus()
            return false
        }
        switch (e.target)
        {
            case this.markendImage:
                // this.dragging.mode = "E"
                this.dragging.x = position.x
                this.dragging.markerPosition = this.markend
                this.dragging.mode = DragModes.MARKEND
                e.preventDefault()
                e.stopPropagation()
                return false
            case this.markstartImage:
                this.dragging.x = position.x
                this.dragging.markerPosition = this.markstart
                this.dragging.mode = DragModes.MARKSTART
                e.preventDefault()
                e.stopPropagation()
                return false
            case this.playheadImage:
                this.dragging.x = position.x
                this.dragging.markerPosition = this.playhead
                this.dragging.mode = DragModes.PLAYHEAD
                e.preventDefault()
                e.stopPropagation()
                return false
        }
        this.dragging.mode = DragModes.NONE
        this.dragging.x = position.x
        this.dragging.y = position.y
        this.dragging.offsetx = this.xoffset
        this.dragging.offsety = this.yoffset
        this.canvas.focus()
        this.editDragDown(msg)
        this.sequenceShouldBeSorted = true
        e.preventDefault()
        e.stopPropagation()
        return false
    }

    private getPosition(e : MouseEvent) {
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        return { x, y, target: e.target }
    }

    private getHoverMessage({ x, y, target } : Position) {
        const time = this.xoffset + (x - X_START) / this.gridWidth * this.xrange
        const n = this.yoffset + (this.height - y) / this.stepHeight
        const message : HoverMessage = { time, n, i: -1, target: Targets.EMPTY }

        if (y >= this.height || x >= this.width) return message
        if (y < RULER_WIDTH)
        {
            message.target = Targets.X_RULER
            return message
        }
        if (x < X_START)
        {
            message.target = Targets.Y_RULER
            return message
        }
        const _n = n|0
        for (let i = 0; i < this.sequence.length; ++i)
        {
            const note = this.sequence[i]
            if (_n === note.n)
            {
                if (note.isSelected && Math.abs(note.t1 - time) * this.stepWidth < 8)
                {
                    message.target === Targets.NOTE_LEFT
                    message.i = i
                    return message
                }
                if (note.isSelected && Math.abs(note.t1+note.t2-time) * this.stepWidth < 8)
                {
                    message.target = Targets.NOTE_RIGHT
                    message.i = i
                    return message
                }
                if (note.t1 <= time && time < note.t1 + note.t2)
                {
                    message.i = i
                    message.target = note.isSelected
                        ? Targets.NOTE_CENTER
                        : Targets.UNSELECTED_NOTE
                    return message
                }
            }
        }
        return message
    }

    private mousemove(e : MouseEvent) {
        if (this.dragging.mode === DragModes.NONE)
        {
            const position = this.getPosition(e)
            const msg = this.getHoverMessage(position)
            this.canvas.style.cursor = (
            { [Targets.NOTE_RIGHT]:      "e-resize"
            , [Targets.NOTE_LEFT]:       "w-resize"
            , [Targets.NOTE_CENTER]:     "move"
            , [Targets.UNSELECTED_NOTE]: "pointer"
            , [Targets.EMPTY]:           "pointer"
            } as Record<any, string>)[msg.target] 
            || "pointer"
        }
    }

    private editDragDown(msg : HoverMessage) {
        if (msg.target === Targets.NOTE_CENTER)
        {
            const note = this.sequence[msg.i]
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_CENTER
            this.dragging.i = msg.i
            this.dragging.time = msg.time
            this.dragging.n = note.n
            for (const note of this.sequence)
            {
                if (note.isSelected)
                {
                    note.lastN = note.n
                    note.lastT = note.t1
                }
            }
            this.redraw()
        }
        else if (msg.target === Targets.UNSELECTED_NOTE)
        {
            const note = this.sequence[msg.i]
            this.clearSelection()
            note.isSelected = true
            this.redraw()
        }
        else if (msg.target === Targets.NOTE_RIGHT)
        {
            const note = this.sequence[msg.i]
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_RIGHT
            this.dragging.i = msg.i
            this.dragging.time = note.t1
            this.dragging.endTime = note.t2
            this.dragging.notes = this.getSelectedNotes()
        }
        else if (msg.target === Targets.NOTE_LEFT)
        {
            const note = this.sequence[msg.i]
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_LEFT
            this.dragging.i = msg.i
            this.dragging.time = note.t1
            this.dragging.endTime = note.t2
            this.dragging.notes = this.getSelectedNotes()
        }
        else if (msg.target === Targets.EMPTY && msg.time >= 0)
        {
            this.clearSelection()
            const t = (msg.time / SNAP | 0) * SNAP
            const note =
                { t1: t
                , n: msg.n|0
                , t2: 1
                , isSelected: true
                , lastN: -1
                , lastT: -1
                }
            this.sequence.push(note)
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_RIGHT
            this.dragging.i = this.sequence.length - 1
            this.dragging.time = t
            this.dragging.endTime = 1
            this.dragging.notes = [{ t1: t, t2: 1, note, i: -1 }]
            this.redraw()
        }
    }

    private clearSelection() {
        for(const note of this.sequence) note.isSelected = false
    }

    private getSelectedNotes() {
        return this.sequence.reduce((notes,note,i) => {
            if (note.isSelected)
            {
                notes.push({ i, note, t1: note.t1, t2: note.t2 })
            }
            return notes
        }, <Array<NotePlus>>[] )
    }

    private pointermove(e : MouseEvent) {
        const position = this.getPosition(e)
        const msg = this.getHoverMessage(position)
        switch (this.dragging.mode)
        {
            case DragModes.NONE:
                this.xoffset 
                    = this.dragging.offsetx 
                    + (this.dragging.x - position.x)
                    * (this.xrange / this.width)
                this.yoffset
                    = this.dragging.offsety
                    + (position.y - this.dragging.y)
                    * (this.yrange / this.height)
                break
            
            // case DragModes.MENU //
            case DragModes.SELECTION:
                this.dragging.p2 = position
                this.dragging.t2 = msg.time
                this.dragging.n2 = msg.n
                this.redraw()
                break

            case DragModes.MARKEND:
                const x = Math.max(1
                    , this.dragging.markerPosition 
                    + (position.x - this.dragging.x) 
                    / this.stepWidth +.5
                    | 0)
                if (this.markstart >= x) this.markstart = x - 1
                this.markend = x
                break
            
            case DragModes.MARKSTART:
                const y = Math.max(1
                    , this.dragging.markerPosition 
                    + (position.x - this.dragging.x) 
                    / this.stepWidth +.5
                    | 0)
                if (this.markend <= y) this.markend = y+1
                this.markstart = y
                break

            case DragModes.PLAYHEAD:
                this.playhead = Math.max(0
                    , this.dragging.markerPosition
                    + (position.x - this.dragging.x)
                    / this.stepWidth + .5
                    | 0)
                break
        }
        this.editDragMove(msg)
        e.stopPropagation()
        return false
    }

    private editDragMove(msg : HoverMessage) {
        if (this.dragging.mode !== DragModes.NOTES) return
        switch (this.dragging.target)
        {
            case Targets.NOTE_RIGHT:
                if (this.dragging.notes.length)
                {
                    const dt 
                        = (Math.max(0,msg.time) / SNAP + 0.9 | 0) * SNAP 
                        - this.dragging.t1
                        - this.dragging.t2
                    const notes = this.dragging.notes
                    for (let i = notes.length - 1; i >= 0; --i)
                    {
                        const note = notes[i].note
                        note.t2 = notes[i].t2 + dt
                        if (note.t2 <= 0) note.t2 = 1
                    }
                }
                this.redraw()
                break

            case Targets.NOTE_LEFT:
                if (this.dragging.notes.length)
                {
                    const dt 
                        = (Math.max(0,msg.time) / SNAP + 0.9 | 0) * SNAP 
                        - this.dragging.t1
                    const notes = this.dragging.notes
                    for (let i = notes.length - 1; i >= 0; --i)
                    {
                        const note = notes[i].note
                        note.t1 = notes[i].t1 + dt
                        note.t2 = notes[i].t2 - dt
                        if (note.t2 <= 0) note.t2 = 1
                    }
                }
                this.redraw()
                break

            case Targets.NOTE_CENTER:
                const note = this.sequence[this.dragging.i]
                this.moveSelectedNote(
                    msg.time - this.dragging.t1 | 0,
                    msg.n - this.dragging.n | 0)
                this.redraw()
                break
        }
    }

    private moveSelectedNote(dt : number, dn : number) {
        for (let i = this.sequence.length - 1; i >= 0; --i)
        {
            const note = this.sequence[i]
            if (note.isSelected && note.lastT + dt < 0)
            {
                dt = -note.lastT
                break
            }
        }
        for (const note of this.sequence)
        {
            if (note.isSelected)
            {
                note.t1 = ((note.lastT + dt) / SNAP + .5 | 0) * SNAP
                note.n = note.lastN + dn
            }
        }
    }

    private contextmenu(e : MouseEvent) {}

    private readonly editmode = "dragmono"
    private cancel(e : MouseEvent) {
        const position = this.getPosition(e)
        if(this.dragging.mode === DragModes.SELECTION)
        {
            this.selectNotes()
            this.dragging.mode = DragModes.NONE
            this.redraw();
        }
        if (this.dragging.mode === DragModes.NOTES && this.editmode === "dragmono")
        {
            for (let i = this.sequence.length - 1; i >= 0; --i)
            {
                const note = this.sequence[i]
                if (note && note.isSelected)
                {
                    this.deleteAreaOfNote(note.t1, note.t2, i)
                }
            }
        }
        this.redraw()
        this.dragging.mode === DragModes.NONE
        if (this.sequenceShouldBeSorted)
        {
            this.sortSequence()
        }
        this.sequenceShouldBeSorted = false

        window.removeEventListener("mousemove",this.bindpointermove,false)
        window.removeEventListener("mouseup",this.bindcancel,false)
        e.preventDefault()
        e.stopPropagation()
        return false
    }

    private selectNotes() {
        let { t1, t2, n1, n2 } = this.dragging
        let t, i = 0, note = this.sequence[i];
        if(n1>n2)
            t=n1,n1=n2,n2=t;
        if(t1>t2)
            t=t1,t1=t2,t2=t;
        while(note){
            if(t1 <= note.t1 && note.t1 < t2 && n1 <= note.n && note.n <= n2)
                note.isSelected = true
            else
            {
                note.isSelected = false
            }
            note = this.sequence[++i];
        }
    }

    private deleteAreaOfNote(t1 : number, t2 : number, j : number) {
        for (let i = this.sequence.length - 1; i >= 0; --i)
        {
            const note = this.sequence[i]
            if (i !== j)
            {
                if (t1 <= note.t1 && note.t1 + note.t2 <= t1 + t2)
                {
                    this.sequence.splice(i, 1)
                }
                else if (t1 <= note.t1 && note.t1 < t1+t2 && note.t1+note.t2 > t1+t2)
                {
                    note.t2 = note.t1 + note.t2 - t1 - t2
                    note.t1 = t1 + t2
                }
                else if (t1 > note.t1 && t1 + t2 < note.t1 + note.t2)
                {
                    this.addNote(t1 + t2, note.n, note.t1 + note.t2 - t1 - t2)
                    note.t2 = t1 - note.t1
                }
            }
        }
    }

    private addNote(t1 : number, n : number, t2 : number)
    {
        const note = { t1, t2, n, lastN: -1, lastT: -1, isSelected: true }
        this.sequence.push(note)
        this.sortSequence()
        this.redraw()
    }

    private sortSequence() {
        this.sequence.sort((x,y) => x.t1 - y.t1);
    }
}

type HoverMessage = { 
    time : number
    n : number
    i : number
    target : Values<typeof Targets>
}

type Note = {
    t1 : number
    t2 : number
    n : number
    isSelected : boolean
    lastN : number
    lastT : number
}

type Point = { x : number, y : number }

type DragData = {
    mode : Values<typeof DragModes>
    target : Values<typeof Targets>
    markerPosition : number
    x : number
    y : number
    i : number
    n : number
    time : number
    endTime : number
    p1 : Point
    p2 : Point
    t1 : number
    t2 : number
    n1 : number
    n2 : number
    offsetx : number
    offsety : number
    notes : NotePlus[]
}

type NotePlus = {
    i : number
    note : Note
    t1 : number
    t2 : number
}

type Position = { x : number, y : number, target : EventTarget | null }







import { MasterClock } from "../../sequencers/master_clock.js"

// type NoteEvent = { start : number, end : number, n : number, sample : number }
// type PlayCallback = (noteEvent : NoteEvent) => void
type PlayCallback = (sample : number, start : number, n : number) => (end : number) => void

const keyboardsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSI0ODAiPg0KPHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBkPSJNMCwwIGgyNHY0ODBoLTI0eiIvPg0KPHBhdGggZmlsbD0iIzAwMCIgZD0iTTAsNDAgaDEydjQwaC0xMnogTTAsMTIwIGgxMnY0MGgtMTJ6IE0wLDIwMCBoMTJ2NDBoLTEyeiBNMCwzMjAgaDEydjQwaC0xMnogTTAsNDAwIGgxMnY0MGgtMTJ6Ii8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIGQ9Ik0wLDYwIGgyNCBNMCwxNDAgaDI0IE0wLDIyMCBoMjQgTTAsMjgwIGgyNCBNMCwzNDAgaDI0IE0wLDQyMCBoMjQiLz4NCjwvc3ZnPg0K"

const KB_WIDTH = 40
const RULER_WIDTH = 24
const SEMIFLAG = [6, 1, 0, 1, 0, 2, 1, 0, 1, 0, 1, 0]
const OCTAVE_OFFSET = -1
const TIMEBASE = 16
const X_START = RULER_WIDTH + KB_WIDTH
const KB_KEYS = (keys => 
    [...keys.toUpperCase()]
        .reduce((a, key, i) => (a[key] = i, a),
    [...keys]
        .reduce((a, key, i) => (a[key] = i, a), {} as Record<string,number>))
)('1234567890-=qwertyuiop[]asdfghjkl;\'zxcvbnm,./')

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
    , KEYBOARD_START: 'K'
    } as const

const DragModes =
    { SELECTION: "A"
    , MARKSTART: "S"
    , MARKEND: "E"
    // , PLAYHEAD: "P"
    , LOOPMARKER: "L"
    , NOTES: "D"
    , NONE: 'none'
    , KB_MARKER: 'K'
    } as const

type Options = {
    editmode? : 'dragpoly' | 'dragmono'
}
    
export class  PianoRollEditor {

    controller = E('div', { className: 'pianoroll-controller' })
    snapToGrid : boolean = true
    _currentSample? : number

    private audioCtx : AudioContext
    private body : HTMLDivElement
    private canvas : HTMLCanvasElement
    private keyboardImage : HTMLDivElement
    private markstartImage : HTMLSpanElement
    private markendImage : HTMLSpanElement
    private playheadImage : HTMLSpanElement
    private loopMarker : HTMLSpanElement
    private keyboardBeginMarker : HTMLSpanElement
    private ctx : CanvasRenderingContext2D
    private sequence : Note[]
    private dragging : DragData
    private width = 485
    private height = 300
    private xrange = 64 // 16
    private yrange = 48 // 16
    private xoffset = -1
    private yoffset = -2
    private playhead = 0
    private markstart = 0
    private markend =  16

    private gridWidth = -1
    private gridHeight = -1
    private stepWidth = -1
    private stepHeight = -1
    private keyboardBeginIndex = 0
    private _kbWriteMode : boolean = false

    private bindcontextmenu : MouseHandler
    private bindpointermove : MouseHandler
    private bindcancel      : MouseHandler

    private sequenceShouldBeSorted = false
    private playCallback : PlayCallback
    private clipboard : Note[] = []

    constructor(audioCtx : AudioContext, playCallback : PlayCallback, options : Options = {}) {
        this.audioCtx = audioCtx
        this.playCallback = playCallback
        if (options.editmode === 'dragpoly')
        {
            this._currentSample = 0
        }

        this.body = E('div', { className: 'wac-body' })
        this.keyboardImage = E('div', { className: 'wac-kb' })
        this.canvas = E('canvas', { className: 'wac-pianoroll' })
        this.markstartImage = E('span', { className: 'marker', text: '　' })
        this.markendImage = E('span', { className: 'marker', text: '　' })
        this.playheadImage = E('span', { className: 'playhead' })
        this.loopMarker = E('span', { className: 'loop-marker', text: '　' })
        this.keyboardBeginMarker = E('span', { className: 'kb-marker', text: '　' })
        

        this.keyboardImage.style.background = `url("${keyboardsrc}")`

        this.body.append(
            this.canvas, 
            this.keyboardImage, 
            this.loopMarker,
            this.keyboardBeginMarker,
            this.markstartImage, 
            this.markendImage, 
            this.playheadImage)

        this.controller.appendChild(this.body)

        this.body.addEventListener("mousedown", this.pointerdown.bind(this), true)
        this.body.addEventListener('wheel', this.wheel.bind(this),false)
        this.canvas.addEventListener('mousemove', this.mousemove.bind(this),false)
        // this.canvas.addEventListener('keydown', this.keydown.bind(this),false)
        this.canvas.tabIndex = -1 // Needed for keydown event to work.

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
            , length: -1
            , offsetx: -1
            , offsety: -1
            , notes: []
            }
        
        // Wait an iteration of the event loop for properties to be set:
        requestAnimationFrame(() => this.layout())

        this.setTempo(MasterClock.getTempo())
        this.subdiv = 8
        if (options.editmode)
        {
            this.editmode = options.editmode
        }
    }

    scheduleNotes() {}
    setTempo(tempo : number) {
        this.tempo = clamp(1, tempo, Infinity)
        this.tick = (60 * 4 / tempo) / this._subdiv
        this.restart()
    }
    getMMLString() {
        return JSON.stringify({ sequence: this.sequence, subdiv: this._subdiv })
    }
    setMMLString(s : string) {

        if (!s.includes('o4l8'))
        {
            const { sequence, subdiv } = JSON.parse(s)
            this.sequence = sequence
            this.subdiv = subdiv
            return;
        }
        
        // Legacy code to not break old graphs:
        this.sequence=[];
        let [i,l,n,t,defo,defl,tie,evlast] : any[] = [];
        const parse={s:s,i:i,tb:this._subdiv};
        function getNum(p : any){
            let n = 0, x = 1
            if (p.s[p.i] === '-')
            {
                ++p.i
                x = -1
            }
            while(p.s[p.i]>="0"&&p.s[p.i]<="9") {
                n=n*10+parseInt(p.s[p.i]);
                ++p.i;
            }
            return n * x;
        }
        function getLen(p : any) {
            let n=getNum(p);
            if(n==0)
                n=defl
            n=p.tb/n;
            let n2=n;
            while(p.s[p.i]==".") {
                ++p.i;
                n+=(n2>>=1);
            }
            return n;
        }
        function getNote(p : any) {
            switch(p.s[p.i]){
            case "c": case "C": n=0; break;
            case "d": case "D": n=2; break;
            case "e": case "E": n=4; break;
            case "f": case "F": n=5; break;
            case "g": case "G": n=7; break;
            case "a": case "A": n=9; break;
            case "b": case "B": n=11; break;
            default:
                n=-1;
            }
            ++p.i;
            if(n<0)
                return -1;
            for(;;) {
                switch(p.s[p.i]) {
                case "-": --n; break;
                case "+": ++n; break;
                case "#": ++n; break;
                default:
                    return n;
                }
                ++p.i;
            }
        }
        defo=4;
        defl=8;
        t=0;
        tie=0;
        evlast=null;
        let z = 0
        for (parse.i=0;parse.i<parse.s.length;) {
            switch (parse.s[parse.i]) {
            case '>':
                ++parse.i; ++defo; n=-1; l=0;
                break;
            case '<':
                ++parse.i; --defo; n=-1; l=0;
                break;
            case '&': case '^':
                ++parse.i; tie=1; n=-1; l=0;
                break;
            case 't': case 'T':
                ++parse.i; n=-1; l=0;
                this.setTempo(getNum(parse));
                break;
            case 'o': case 'O':
                ++parse.i; n=-1; l=0;
                defo=getNum(parse);
                break;
            case 'l': case 'L':
                ++parse.i; n=-1; l=0;
                defl=getNum(parse);
                break;
            case 'r': case 'R':
                ++parse.i; n=-1;
                l=getLen(parse);
                break;
            default:
                n=getNote(parse);
                if(n>=0)
                    l=getLen(parse);
                else
                    l=0;
                break;
            }
            if(n>=0){
                n=(defo+1)*12+n;
                if(tie && evlast && evlast.n==n){
                    evlast.length+=l;
                    tie=0;
                }
                else
                    this.sequence.push(evlast = 
                        { time:t
                        , n
                        , length: l
                        , isSelected: false
                        , lastT: -1
                        , lastN: -1
                        , sample: this._currentSample ?? -1
                        })
            }
            t+=l;
        }
        // Warining: replacing this.layout
        // with this.render here 
        // can cause it to crash:
        this.layout()
        this.restart()
    }

    set subdiv(subdivision : number) {
        this._subdiv = subdivision
        this.tick = (60 * 4 / this.tempo) / this._subdiv
        this.restart()
    }
    get subdiv() {
        return this._subdiv
    }

    set currentSample(s : number) {
        this._currentSample = s
        this.sequence.forEach(note => note.isSelected && (note.sample = s))
        this.render()
    }
    get currentSample() { 
        return this._currentSample ?? -1
    }

    private tempo = 120
    private tick = -1
    private _subdiv = 16

    play() {
        const tick = this.tick
        const nSteps = this.markend - this.markstart
        const loopLength = tick * nSteps
        const t = Math.max(0, this.audioCtx.currentTime - loopLength)

        const filteredSequence = this.sequence.filter(note => 
            this.markstart <= note.time && note.time < this.markend)

        const elapsedLoops = Math.floor(t / loopLength)

        let loopTime = elapsedLoops * loopLength
        let noteTime = loopTime
        let noteIndex = 0 // startIndex

        this.scheduleNotes = () => {
            const currentTime = this.audioCtx.currentTime
            this.playhead = this.markstart + (currentTime % loopLength) / tick
            this.drawPlayhead()
            if (filteredSequence.length === 0) return;

            while (noteTime < currentTime + 0.200)
            {
                if (noteTime > currentTime)
                {
                    const { length, n, sample } = filteredSequence[noteIndex]
                    // this.playCallback({ start: noteTime, end: noteTime + length * tick, n, sample })
                    this.playCallback(sample, noteTime, n)(noteTime + length * tick)
                }
                ++noteIndex
                if (noteIndex >= filteredSequence.length)// endIndex)
                {
                    noteIndex = 0 // startIndex
                    loopTime += loopLength
                }
                // else if (noteIndex < startIndex)
                // {
                //     noteIndex = startIndex
                // }
                noteTime = loopTime + (filteredSequence[noteIndex].time - this.markstart) * tick
            }
        }
    }

    private stop() {
        this.scheduleNotes = () => void 0
    }

    private restart() {
        this.stop()
        this.play()
    }

    setDimensions(height : number, width : number) {
        this.height = height
        this.width = width
        this.layout()
    }

    // Rendering functions |||||||||||||||||||||||||||||||||||||||||||||||
    private firstTime = true
    private layout() {
        this.canvas.width = this.width
        this.body.style.width = 
        this.canvas.style.width =
            this.width + 'px'

        this.canvas.height = this.height
        this.body.style.height = 
        this.canvas.style.height =
            this.height + 'px'

        // TODO: switch with OLD if major bugs are found related to this:
        // NEW:
        if (this.firstTime)
        {
            this.firstTime = false
            this.gridWidth = window.innerWidth - X_START
            this.gridHeight = window.innerHeight - RULER_WIDTH
        }
        // OLD:
            // this.gridWidth = this.width - X_START
            // this.gridHeight = this.height - RULER_WIDTH


        this.render()
    }

    private render() {
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.stepWidth = this.gridWidth / this.xrange
        this.stepHeight = this.gridHeight / this.yrange
        this.drawGrid()
        this.drawSequence()
        this.drawYRuler()
        this.drawXRuler()
        this.drawMarker()
        this.drawSelectedArea()
        this.drawKbMarker()
    }

    private drawGrid() {
        // Horizontal grid lines
        const darkColor = '#222'
        const liteColor = '#444'
        const hGridColor = '#555'
        for (let i = 0, lastColor = ''; i < 128; ++i)
        {
            const color = SEMIFLAG[i % 12] & 1 ? darkColor : liteColor
            this.ctx.fillStyle = color
            const y = this.height + (this.yoffset - i) * this.stepHeight | 0
            this.ctx.fillRect(X_START, y, this.gridWidth, -this.stepHeight)
            if (color === lastColor)
            {
                this.ctx.fillStyle = hGridColor
                this.ctx.fillRect(X_START, y, this.gridWidth, 1)
            }
            lastColor = color
        }
        
        // Vertical grid lines
        const color = '#666'
        const color2 = '#aaa'
        const gap = 2 ** ((this.xrange / 2) ** .25 | 0) // 4
        for (let i = 0, j = 0;; i += gap, j++)
        {
            const accent = j % 4 === 0
            this.ctx.fillStyle = accent ? color2 : color
            const x = this.stepWidth * (i - this.xoffset) + X_START | 0
            // const overlap = 4 + +accent * 3
            // this.ctx.fillRect(x, RULER_WIDTH - overlap, 1, this.gridHeight + overlap)
            this.ctx.fillRect(x, RULER_WIDTH, 1, this.gridHeight)
            if (x >= this.width) break
        }
    }

    private drawSequence() {
        for (const { time, length, isSelected, n, sample } of this.sequence)
        {
            this.ctx.fillStyle = sample >= 0
                ? `rgb(${128 + (sample * 30 + +isSelected * 10)      % 128},
                       ${128 + (sample * 51 + 30 + +isSelected * 10) % 128},
                       ${128 + (sample * 72 + 60 + +isSelected * 10) % 128})`
                : isSelected ? 'lightgreen' : 'green'
            const w = length * this.stepWidth
            const x = (time - this.xoffset) * this.stepWidth + X_START
            const x2 = x + w | 0
            const x3 = x | 0
            const y = this.height - (n - this.yoffset) * this.stepHeight
            const y2 = y - this.stepHeight | 0
            const y3 = y | 0
            this.ctx.beginPath()
            this.ctx.fillRect(x3, y3, x2 - x3, y2 - y3)
            this.ctx.fillStyle = isSelected ? 'white' : 'black'
            this.ctx.fillRect(x3,y3,1,y2-y3)
            this.ctx.fillRect(x2,y3,1,y2-y3)
            this.ctx.fillRect(x3,y3,x2-x3,1)
            this.ctx.fillRect(x3,y2,x2-x3,1)
        }
    }

    private drawYRuler() {
        const rulerColor = '#333'
        const foregroundColor = '#aaa'

        this.ctx.textAlign = 'right'
        this.ctx.font = "12px 'sans-serif'"
        this.ctx.fillStyle = rulerColor
        this.ctx.fillRect(0, RULER_WIDTH, RULER_WIDTH, this.gridHeight)

        this.ctx.fillStyle = foregroundColor
        for (let i = 0; i < 128; i += 12)
        {
            const y = this.height - this.stepHeight * (i - this.yoffset)
            // this.ctx.fillRect(0, y | 0, RULER_WIDTH, -1)
            this.ctx.fillText(`C${i/12 + OCTAVE_OFFSET | 0}`, RULER_WIDTH - 4, y - 4)
        }
        const style = this.keyboardImage.style
        style.top = style.left = RULER_WIDTH + 'px'
        style.width = KB_WIDTH + 'px'
        style.backgroundSize = `100% ${this.stepHeight * 12}px`
        style.backgroundPosition = 
            `0px ${this.height - RULER_WIDTH + this.stepHeight * this.yoffset}px`
    }

    private drawXRuler() {
        const rulerColor = '#333'
        const foregroundColor = '#bbb'

        this.ctx.textAlign = 'left'
        this.ctx.font = (RULER_WIDTH / 2) + "px 'sans-serif'"
        this.ctx.fillStyle = rulerColor
        this.ctx.fillRect(0, 0, this.width, RULER_WIDTH)
        this.ctx.fillStyle = foregroundColor
        for (let t = 0;; t += TIMEBASE)
        {
            const x = (t - this.xoffset) * this.stepWidth + X_START | 0
            this.ctx.fillRect(x, 0, 1, RULER_WIDTH)
            this.ctx.fillText((t / TIMEBASE + 1).toString(), x + 4, RULER_WIDTH - 12)
            if (x >= this.width) break
        }
    }

    private drawMarker() {
        const start = (this.markstart - this.xoffset) * this.stepWidth + X_START
        const end = (this.markend - this.xoffset) * this.stepWidth + X_START
        const endOffset = -16
        this.markstartImage.style.left = start + 'px'
        this.markendImage.style.left = (end + endOffset) + 'px'
        this.loopMarker.style.left = start + 'px'
        this.loopMarker.style.width = (end - start) + 'px'
        this.drawPlayhead()
    }

    private drawPlayhead() {
        const now = (this.playhead - this.xoffset) * this.stepWidth + X_START
        this.playheadImage.style.left = now + 'px'
    }

    private drawSelectedArea() {
        if (this.dragging.mode === DragModes.SELECTION)
        {
            const { p1, p2 } = this.dragging
            this.ctx.fillStyle = "rgba(0,0,0,0.3)"
            this.ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
        }
    }

    private drawKbMarker() {
        if (this._kbWriteMode)
        {
            const i = this.keyboardBeginIndex
            const y = this.height + (this.yoffset - i) * this.stepHeight | 0
            this.keyboardBeginMarker.style.top = (y - 20) + 'px'
        }
    }
    //                     |||||||||||||||||||||||||||||||||||||||||||||||




    private pointerdown(e : MouseEvent) {
        const position = this.getPosition(e)
        const msg = this.getHoverMessage(position)
        
        window.addEventListener("mousemove", this.bindpointermove,false)
        window.addEventListener("mouseup", this.bindcancel)
        window.addEventListener("contextmenu", this.bindcontextmenu)
        
        if (e.ctrlKey)
        {
            this.clearSelection()
            if (this.clipboard.length === 0) return false
            const startTime = this.clipboard.sort((a, b) => a.time - b.time)[0].time
            const startN = this.clipboard[0].n
            const time = this.snapToGrid ? (msg.time / SNAP | 0) * SNAP : msg.time
            let i = 0
            for (const noteToCopy of this.clipboard)
            {
                const n = noteToCopy.n + msg.n - startN |0
                const noteTime = noteToCopy.time + time - startTime
                const note =
                    { time: noteTime
                    , n
                    , length: noteToCopy.length
                    , isSelected: true
                    , lastN: n
                    , lastT: noteTime
                    , sample: noteToCopy.sample
                    }
                this.sequence.push(note)
                
                if (i === 0)
                {
                    i = 1
                    this.dragging.n = n
                    this.dragging.time = time
                }
            }
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_CENTER
            this.dragging.notes = this.getSelectedNotes()

            this.render()
            this.restart()
            return false
        }
        if (e.buttons === 2)
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
                this.dragging.mode = DragModes.MARKEND
                this.dragging.x = position.x
                this.dragging.markerPosition = this.markend
                e.preventDefault()
                e.stopPropagation()
                return false
            case this.markstartImage:
                this.dragging.mode = DragModes.MARKSTART
                this.dragging.x = position.x
                this.dragging.markerPosition = this.markstart
                e.preventDefault()
                e.stopPropagation()
                return false
            case this.loopMarker:
                this.dragging.mode = DragModes.LOOPMARKER
                this.dragging.x = position.x
                this.dragging.markerPosition = this.markstart
                e.preventDefault()
                e.stopPropagation()
                return false

            case this.keyboardBeginMarker:
                this.dragging.mode = DragModes.KB_MARKER
                this.dragging.y = position.y
                e.preventDefault()
                e.stopPropagation()
                return false

            // case this.playheadImage:
            //     this.dragging.mode = DragModes.PLAYHEAD
            //     this.dragging.x = position.x
            //     this.dragging.markerPosition = this.playhead
            //     e.preventDefault()
            //     e.stopPropagation()
            //     return false
        }
        this.dragging.mode = DragModes.NONE
        this.dragging.x = position.x
        this.dragging.y = position.y
        this.dragging.offsetx = this.xoffset
        this.dragging.offsety = this.yoffset
        this.dragging.target = msg.target
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
        return { x, y }
    }

    private getHoverMessage({ x, y } : Position) {
        const time = this.xoffset + (x - X_START) / this.gridWidth * this.xrange
        const n = this.yoffset + (this.height - y) / this.stepHeight
        const message : HoverMessage = { time, n, i: -1, target: Targets.EMPTY }

        if (y >= this.height || x >= this.width)
        {
            return message
        }
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
                if (note.isSelected && 
                    Math.abs(note.time - 0.25 - time) * this.stepWidth < 4)
                {
                    message.target = Targets.NOTE_LEFT
                    message.i = i
                    return message
                }
                if (note.isSelected && 
                    Math.abs(note.time + note.length + 0.25 - time) * this.stepWidth < 4)
                {
                    message.target = Targets.NOTE_RIGHT
                    message.i = i
                    return message
                }
                if (note.time <= time && time < note.time + note.length)
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
                    note.lastT = note.time
                }
            }
            this.render()
        }
        else if (msg.target === Targets.UNSELECTED_NOTE)
        {
            const note = this.sequence[msg.i]
            this.clearSelection()
            note.isSelected = true
            this.render()
        }
        else if (msg.target === Targets.NOTE_RIGHT)
        {
            const note = this.sequence[msg.i]
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_RIGHT
            this.dragging.i = msg.i
            this.dragging.time = note.time
            this.dragging.length = note.length
            this.dragging.notes = this.getSelectedNotes()
        }
        else if (msg.target === Targets.NOTE_LEFT)
        {
            const note = this.sequence[msg.i]
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_LEFT
            this.dragging.i = msg.i
            this.dragging.time = note.time
            this.dragging.length = note.length
            this.dragging.notes = this.getSelectedNotes()
        }
        else if (msg.target === Targets.EMPTY && msg.time >= 0)
        {
            this.clearSelection()
            const time = this.snapToGrid ? (msg.time / SNAP | 0) * SNAP : msg.time
            const length = this.snapToGrid ? 1 : 0.2
            const note =
                { time
                , n: msg.n|0
                , length
                , isSelected: true
                , lastN: -1
                , lastT: -1
                , sample: this._currentSample ?? -1
                }
            this.sequence.push(note)
            this.dragging.mode = DragModes.NOTES
            this.dragging.target = Targets.NOTE_RIGHT
            this.dragging.i = this.sequence.length - 1
            this.dragging.time = time
            this.dragging.length = length
            this.dragging.notes = [{ time, length, note, i: -1 }]
            this.render()
            this.restart()
        }
    }

    private clearSelection() {
        for(const note of this.sequence) note.isSelected = false
    }

    private getSelectedNotes() {
        return this.sequence.reduce((notes,note,i) => {
            if (note.isSelected)
            {
                notes.push({ i, note, time: note.time, length: note.length })
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
                if ((this.dragging.target !== Targets.X_RULER &&
                    this.dragging.target !== Targets.Y_RULER) || e.ctrlKey) return false

                this.xoffset
                    = this.dragging.offsetx 
                    + (this.dragging.x - position.x)
                    * (this.xrange / this.width)
                this.yoffset
                    = this.dragging.offsety
                    + (position.y - this.dragging.y)
                    * (this.yrange / this.height)
                this.layout()
                break
            
            // case DragModes.MENU //
            case DragModes.SELECTION:
                this.dragging.p2 = position
                this.dragging.t2 = msg.time
                this.dragging.n2 = msg.n
                this.render()
                break

            case DragModes.MARKEND:
                const x = Math.max(1
                    , this.dragging.markerPosition 
                    + (position.x - this.dragging.x) 
                    / this.stepWidth +.5
                    | 0)
                if (this.markstart >= x) this.markstart = x - 1
                this.markend = x
                this.drawMarker()
                break
            
            case DragModes.MARKSTART:
                const y = Math.max(0
                    , this.dragging.markerPosition 
                    + (position.x - this.dragging.x) 
                    / this.stepWidth +.5
                    | 0)
                if (this.markend <= y) this.markend = y+1
                this.markstart = y
                this.drawMarker()
                break

            case DragModes.LOOPMARKER: 
                const z = Math.max(0
                    , this.dragging.markerPosition 
                    + (position.x - this.dragging.x) 
                    / this.stepWidth +.5
                    | 0)
                const width = this.markend - this.markstart
                this.markstart = z
                this.markend = z + width
                this.drawMarker()
                break
                
            case DragModes.KB_MARKER:
                // const y1 = this.dragging.y
                const y2 = position.y
                this.keyboardBeginIndex = 
                    this.yoffset - (y2 - this.height) / this.stepHeight | 0
                this.drawKbMarker()
                break

            // case DragModes.PLAYHEAD:
            //     this.playhead = Math.max(0
            //         , this.dragging.markerPosition
            //         + (position.x - this.dragging.x)
            //         / this.stepWidth + .5
            //         | 0)
            //     this.drawMarker()
            //     break
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
                    const notes = this.dragging.notes
                    const time = Math.max(0,msg.time)
                    const dt 
                        = (this.snapToGrid ? (time / SNAP + 0.9 | 0) * SNAP : time)
                        - this.dragging.time
                        - this.dragging.length
                    const minLength = this.snapToGrid ? 1 : 0.2
                    for (let i = notes.length - 1; i >= 0; --i)
                    {
                        const note = notes[i].note
                        note.length = notes[i].length + dt
                        if (note.length <= 0) note.length = minLength
                    }
                }
                this.render()
                break

            case Targets.NOTE_LEFT:
                if (this.dragging.notes.length)
                {
                    const notes = this.dragging.notes
                    const time = Math.max(0, msg.time)
                    const dt = (this.snapToGrid
                        ? (time / SNAP + 0.9 | 0) * SNAP
                        : time) - this.dragging.time

                    for (let i = notes.length - 1; i >= 0; --i)
                    {
                        const note = notes[i].note
                        note.time = notes[i].time + dt
                        note.length = notes[i].length - dt
                        if (note.length <= 0) note.length = 1
                    }
                }
                this.render()
                break

            case Targets.NOTE_CENTER:
                this.moveSelectedNote(
                    this.snapToGrid ? msg.time - this.dragging.time | 0 : msg.time - this.dragging.time,
                    (msg.n|0) - this.dragging.n)
                this.render()
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
                note.n = note.lastN + dn
                note.time = this.snapToGrid 
                    ? ((note.lastT + dt) / SNAP + .5 | 0) * SNAP 
                    : note.lastT + dt
            }
        }
    }

    private contextmenu(e : MouseEvent) {}

    private editmode : 'dragmono' | 'dragpoly' = "dragmono"
    private cancel(e : MouseEvent) {
        const position = this.getPosition(e)
        if(this.dragging.mode === DragModes.SELECTION)
        {
            this.selectNotes()
            this.dragging.mode = DragModes.NONE
            this.render();
        }
        if (this.dragging.mode === DragModes.NOTES && this.editmode === "dragmono")
        {
            for (let i = this.sequence.length - 1; i >= 0; --i)
            {
                const note = this.sequence[i]
                if (note && note.isSelected)
                {
                    this.deleteAreaOfNote(note.time, note.length, i)
                }
            }
        }
        if (this.dragging.mode === DragModes.MARKSTART 
         || this.dragging.mode === DragModes.MARKEND
         || this.dragging.mode === DragModes.NOTES)
        {
            this.restart()
        }
        this.render()
        this.dragging.mode = DragModes.NONE
        if (this.sequenceShouldBeSorted) this.sortSequence()
        this.sequenceShouldBeSorted = false

        window.removeEventListener("mousemove",this.bindpointermove,false)
        window.removeEventListener("mouseup",this.bindcancel,false)
        window.removeEventListener("contextmenu", this.bindcontextmenu)

        e.preventDefault()
        e.stopPropagation()
        return false
    }

    private selectNotes() {
        let { t1, t2, n1, n2 } = this.dragging
        
        let t
        if(n1>n2)
            t=n1,n1=n2,n2=t;
        if(t1>t2)
            t=t1,t1=t2,t2=t;
            
        for (const note of this.sequence)
        {
            note.isSelected =
                t1 <= note.time && note.time < t2 && 
                n1 <= note.n && note.n <= n2
        }
    }

    private deleteAreaOfNote(time : number, length : number, j : number) {
        for (let i = this.sequence.length - 1; i >= 0; --i)
        {
            const note = this.sequence[i]
            if (i !== j)
            {
                if (time <= note.time && note.time + note.length <= time + length)
                {
                    this.sequence.splice(i, 1)
                }
                else if (time <= note.time && note.time < time + length && 
                note.time + note.length > time + length)
                {
                    note.length = note.time + note.length - time - length
                    note.time = time + length
                }
                else if (note.time <= time && time < note.time + note.length &&
                time + length >= note.time + note.length)
                {
                    note.length = time - note.time
                }
                else if (time > note.time && time + length < note.time + note.length)
                {
                    this.addNote(time + length, note.n, note.time + note.length - time - length)
                    note.length = time - note.time
                }
            }
        }
    }

    private addNote(time : number, n : number, length : number)
    {
        if (time >= 0 && 0 <= n && n < 128)
        {
            const note = { time, length, n, lastN: -1, lastT: -1, isSelected: true, sample: this._currentSample ?? -1 }
            this.sequence.push(note)
            this.sortSequence()
            this.render()
        }
    }

    private sortSequence() {
        this.sequence.sort((x,y) => x.time - y.time);
    }

    private wheel(e : WheelEvent) {
        const position = this.getPosition(e)
        this.zoom(e.ctrlKey, e.deltaY / 500, position)
        e.preventDefault()
    }

    zoom(x_axis : boolean, amount : number, position? : Position) {
        if (!position)
        {
            const { width, height } = this.canvas.getBoundingClientRect()
            position = { x: width / 2, y: height / 2 }
        }
        const msg = this.getHoverMessage(position)
        const factor = 1 + amount
        const [offset, range, x] = x_axis
            ? ['xoffset', 'xrange', 'time'] as const
            : ['yoffset', 'yrange', 'n']    as const

        this[offset] = msg[x] + (this[offset] - msg[x]) * factor
        this[range] *= factor

        this.layout()
    }

    private keyIsDownSoDontSpam = {} as Record<string,boolean>
    keydown(e : KeyboardEvent) {
        if (e.key === 'Delete')
        {
            this.deleteSelectedNotes()
            this.render()
            return
        }
        if (e.ctrlKey)
        {
            switch(e.key)
            {
                case 'c':
                    const selectedNotes = this.sequence.filter(note => note.isSelected)
                    this.clipboard = JSON.parse(JSON.stringify(selectedNotes))
                    // Flicker the selected notes:
                    selectedNotes.forEach(note => note.isSelected = false)
                    this.render()
                    setTimeout(() => {
                        selectedNotes.forEach(note => note.isSelected = true)
                        this.render()
                    }, 40)
                    break
                case 'x':
                    this.clipboard = JSON.parse(JSON.stringify(this.sequence.filter(note => note.isSelected)))
                    this.deleteSelectedNotes()
                    this.render()
                    break
            }
            return;
        }
        const key = this.keyboardBeginIndex + KB_KEYS[e.key]
        if (this._kbWriteMode && !isNaN(key))
        {
            if (this.keyIsDownSoDontSpam[key]) return;
            this.keyIsDownSoDontSpam[key] = true

            if (this._currentSample == null) throw 'This is only supposed to be used with SamplePianoroll'
            const t = this.playhead

            const stopSound = this.playCallback(
                this._currentSample ?? -1, 
                this.audioCtx.currentTime, 
                key)

            const keyup = () => {
                const u = this.playhead
                const length = (u >= t ? u : this.markend) - t || 0.1
                this.addNote(t, key, length)
                this.keyIsDownSoDontSpam[key] = false
                this.restart()
                stopSound(this.audioCtx.currentTime)
                document.removeEventListener('keyup', keyup)
            }
            document.addEventListener('keyup', keyup)
            return
        }
    }

    set kbWriteMode(on : boolean) {
        this.keyboardBeginMarker.style.display = on
            ? 'inline-block'
            : 'none'
        this._kbWriteMode = on
        this.render()
    }
    get kbWriteMode() {
        return this._kbWriteMode
    }

    private deleteSelectedNotes() {
        let restart = false
        for (let i = this.sequence.length-1; i >= 0; --i) {
            const note = this.sequence[i]
            if(note.isSelected) 
            {
                this.sequence.splice(i, 1)
                restart = true
            }
        }
        if (restart) this.restart()
    }
}

type HoverMessage = { 
    time : number
    n : number
    i : number
    target : Values<typeof Targets>
}

type Note = {
    time : number
    length : number
    n : number
    isSelected : boolean
    lastN : number
    lastT : number
    sample : number
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
    length : number
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
    time : number
    length : number
}

type Position = { x : number, y : number } //, target : EventTarget | null }
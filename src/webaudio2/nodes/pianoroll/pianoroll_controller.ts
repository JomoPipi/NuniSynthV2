






type NoteEvent = { start : number, end : number, n : number }
type PlayCallback = (noteEvent : NoteEvent) => void

type Note = {
    startTime : number
    endTime : number
    n : number
    isSelected : boolean
}

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

    constructor(audioCtx : AudioContext) {
        this.audioCtx = audioCtx

        const markstartsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAwLDIzIHoiLz4NCjwvc3ZnPg0K"
        const cursorsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj4NCjxwYXRoIGZpbGw9InJnYmEoMjU1LDEwMCwxMDAsMC44KSIgZD0iTTAsMSAyNCwxMiAwLDIzIHoiLz4NCjwvc3ZnPg0K"
        const markendsrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAyNCwyMyB6Ii8+DQo8L3N2Zz4NCg=="

        this.body = E('div', { className: 'wac-body' })
        this.keyboardImage = E('div', { className: 'wac-kb' })
        this.canvas = E('canvas', { className: 'wac-pianoroll' })
        this.markstart = E('img', { className: 'marker' })
        this.markend = E('img', { className: 'marker' })
        this.cursor = E('img', { className: 'marker' })

        this.markstart.src = markstartsrc
        this.markend.src = markendsrc
        this.cursor.src = cursorsrc

        this.body.append(this.canvas, this.keyboardImage, this.markstart, this.markend, this.cursor)
        this.controller.appendChild(this.body)

        this.ctx = this.canvas.getContext('2d')!
        this.sequence = []
        this.dragging = {}
        // this.keyboardImage = 
    }

    scheduleNotes() {}
    setTempo(tempo : number) {}
    play(playCallback : PlayCallback) {}
    getMMLString() { return '' }
    setMMLString(s : string) {}
}
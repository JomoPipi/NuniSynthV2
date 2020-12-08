






import { createSubdivSelect3 } from "../../../nunigraph/view/create_subdivselect.js"
import { AutomationPointsEditor } from "./automation_editor.js"
import { createRadioButtonGroup, JsDial } from "../../../UI_library/internal.js"
import { VolumeNodeContainer } from "../../volumenode_container.js"

export class AutomationNode extends VolumeNodeContainer {
    ctx : AudioContext
    phaseShift = 0
    private _nMeasures = 1
    private startTime = 0
    private measureTime = 0
    private isPlaying = false
    private tempo = 120
    private updateProgressLine = (value : number) => {}
    private durationOfLoop = -1
    private pointEditor = new AutomationPointsEditor()

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.play()
    }

    get points() { return this.pointEditor.points }
    set points(p) { this.pointEditor.points = p }
    get nMeasures() { return this._nMeasures }
    set nMeasures(m) { 
        this._nMeasures = m
        this.durationOfLoop = 60 * 4 * this._nMeasures / this.tempo
    }

    getController() {
        const nodeCanvas = this.pointEditor.getController()

        const progressLine = E('canvas')
        drawProgressLine : {
            const h = 2
            progressLine.style.display = 'block'
            progressLine.height = h
            
            this.updateProgressLine = v => {
                const ctx = progressLine.getContext('2d')!
                ctx.fillStyle = '#AB6'
                ctx.clearRect(0, 0, progressLine.width, h)
                ctx.fillRect(0, 0, progressLine.width * v, h)
            }
        }

        const subdivSelect = createSubdivSelect3(
            1 / this._nMeasures, 
            value => this.nMeasures = 1 / clamp(1e-9, value, 1e9),
            { mouseup: () => { this.stop(); this.play() } }
            ).container

        const phaseShifter = E('div', { text: 'phase' })
            {
            const percent = E('div', { text: '0.0%' }); percent.style.width = '50px'
            const control = E('input', { className: 'fader-0' })
            control.style.display = 'block'
            control.type = 'range'
            control.min = '0'
            control.max = '1'
            control.step = (2**-8).toString()
            control.value = this.phaseShift.toString()
            ;(control.oninput = () => 
                percent.innerText = (100 * (this.phaseShift = +control.value)).toFixed(0) + '%'
            )()
            phaseShifter.append(percent, control)
            }

        const modeSelect = createRadioButtonGroup(
            { buttons: ['👌', '✏️']
            , selected: 0
            , className: 'top-bar-btn'
            , onclick: (_, index) => this.pointEditor.setMode(index)
            })

        const hardwareControls = E('div', 
            { className: 'space-evenly some-padding'
            , children: [subdivSelect, phaseShifter, modeSelect] 
            })

        const controller = E('div', { children: [nodeCanvas, progressLine, hardwareControls] })
        return controller
    }

    addInput(node : Indexed) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : Indexed) {
        node.audioNode.disconnect(this.volumeNode)
    }

    updateTempo(tempo : number) {
        this.tempo = clamp(1, tempo, Infinity)

        this.stop()
        this.play()
    }

    play() {
        this.isPlaying = true
        this.startTime = 0
        this.measureTime = 0
        this.durationOfLoop = 60 * 4 * this.nMeasures / this.tempo

        // Prevent lag during scheduleNotes:
        const t = Math.max(0, this.ctx.currentTime - this.durationOfLoop)
        this.measureTime = Math.floor(t / this.durationOfLoop) * this.durationOfLoop
    }
    
    stop() {
        this.volumeNode.gain.cancelScheduledValues(this.ctx.currentTime)
        this.isPlaying = false
    }

    nextMeasure() {
        this.measureTime += this.durationOfLoop
    }
    
    scheduleNotes() {
        if (!this.isPlaying) return;
        const time = this.ctx.currentTime
        const phase = this.phaseShift * this.durationOfLoop
        const currentTime = time - this.startTime + phase
        const percentage = 1 - (this.measureTime - currentTime - 0.200) / this.durationOfLoop
        // TODO: check if window is open before doing this:
        this.updateProgressLine(percentage)
        while (this.measureTime < currentTime + 0.200) 
        {
            for (const { x, y } of this.pointEditor.points)
            {
                const autoTime = this.measureTime + x * this.durationOfLoop + phase
                this.volumeNode.gain.linearRampToValueAtTime(y, autoTime)
            }
            this.nextMeasure()
        }
    }
}
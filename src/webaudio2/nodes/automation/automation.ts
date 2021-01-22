






import { createSubdivSelect3 } from "../../../nunigraph/view/create_subdivselect.js"
import { AutomationPointsEditor } from "./automation_editor.js"
import { createRadioButtonGroup } from "../../../UI_library/internal.js"
import { VolumeNodeContainer } from "../../volumenode_container.js"
import { MasterClock } from "../../sequencers/master_clock.js"
import { createDraglineElement } from "../../../UI_library/components/dragline.js"

export class AutomationNode extends VolumeNodeContainer
    implements AudioNodeInterfaces<NodeTypes.AUTO> {
        
    ctx : AudioContext
    phaseShift = 0
    isPlaying = true
    private _nMeasures = 1
    private measureTime = 0
    private tempo = 120
    private updateProgressLine = (value : number) => {}
    private durationOfLoop = -1
    private pointEditor = new AutomationPointsEditor()
    private dialogBoxIsOpen = false
    private controller? : HTMLElement
    private progressLine = E('canvas')

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.setTempo(MasterClock.getTempo())
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
        this.dialogBoxIsOpen = true
        return this.controller || (this.controller = this.reallyGetController())
    }

    updateBoxDimensions(H : number, W : number) {
        this.pointEditor.setDimensions(H, W)
        this.progressLine.width = W
    }

    deactivateWindow() {
        this.dialogBoxIsOpen = false
    }

    addInput(node : Indexed) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : Indexed) {
        node.audioNode.disconnect(this.volumeNode)
    }

    setTempo(tempo : number) {
        this.tempo = clamp(1, tempo, Infinity)
        this.durationOfLoop = 60 * 4 * this._nMeasures / this.tempo
    }

    sync() {
        this.stop()
        this.play()
    }

    play() {
        this.isPlaying = true
        this.measureTime = 0
        this.durationOfLoop = 60 * 4 * this._nMeasures / this.tempo

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
        const time = this.ctx.currentTime
        const phase = this.phaseShift * this.durationOfLoop
        const currentTime = time + phase
        const percentage = 1 - (this.measureTime - currentTime - 0.200) / this.durationOfLoop
        if (this.dialogBoxIsOpen)
        {
            this.updateProgressLine(percentage)
        }
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

    private reallyGetController() {
        if (this.controller) 
        {
            throw 'You shouldn\'t have called this function where ever or when ever you did.'
        }

        const nodeCanvas = this.pointEditor.getController()

        drawProgressLine: {
            const ctx = this.progressLine.getContext('2d')!
            const h = 2
            // const margin = 15
            this.progressLine.style.display = 'block'
            this.progressLine.height = h
            
            this.updateProgressLine = v => {
                if (!this.dialogBoxIsOpen) return;
                ctx.fillStyle = '#AB6'
                ctx.clearRect(0, 0, this.progressLine.width, h)
                // ctx.fillRect(margin, 0, (progressLine.width - margin * 2) * v, h)
                ctx.fillRect(0, 0, this.progressLine.width * v, h)
            }
        }

        const subdivSelect = createSubdivSelect3(
            1 / this._nMeasures, 
            value => this.nMeasures = 1 / clamp(1e-9, value, 1e9),
            { mouseup: () => this.sync() }
            )

        const modeSelect = createRadioButtonGroup(
            { buttons: ['👌', '✏️']
            , selected: 0
            , className: 'top-bar-btn'
            , onclick: (_, index) => this.pointEditor.setMode(index)
            })
            
        const phaseShifter = createDraglineElement(this, 'phaseShift', { min: 0, max: 1 })

        const hardwareControls = E('div', 
            { className: 'space-evenly some-padding'
            , children: [subdivSelect, modeSelect, phaseShifter] 
            })

        const controller = E('div', { children: [nodeCanvas, this.progressLine, hardwareControls] })
        return controller
    }
}
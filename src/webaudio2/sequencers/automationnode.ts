






import { createSubdivSelect3 } from "../../nunigraph/view/create_subdivselect.js"
import { AutomationPointsEditor } from "../../UI_library/components/automation_editor.js"
import { VolumeNodeContainer } from "../volumenode_container.js"

export class AutomationNode extends VolumeNodeContainer {
    ctx : AudioContext
    startTime = 0
    measureTime = 0
    phaseShift = 0
    isPlaying = false
    tempo = 120
    updateProgressLine = (value : number) => {}

    private durationOfLoop = -1
    private nMeasures = 1
    private controller = new AutomationPointsEditor()

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.play()
    }

    getController(ancestor : HTMLElement) {
        const nodeCanvas = this.controller.getController(ancestor)
        const controller = E('div')

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
            1 / this.nMeasures, 
            value => this.updateMeasures(1 / clamp(1e-9, value, 1e9)),
            { mouseup: () => { this.stop(); this.play() } }
            ).container

        controller.append(nodeCanvas, progressLine, subdivSelect)

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

    updateMeasures(n : number) {
        this.nMeasures = n
        this.durationOfLoop = 60 * 4 * this.nMeasures / this.tempo
    }

    play() {
        this.isPlaying = true
        this.startTime = 0
        this.measureTime = 0
        this.durationOfLoop = 60 * 4 * this.nMeasures / this.tempo

        // Prevent lag:
        const currentTime = this.ctx.currentTime
        while (this.measureTime < currentTime - this.durationOfLoop) this.nextMeasure()
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
        const currentTime = time - this.startTime
        const percentage = 1 - (this.measureTime - currentTime - 0.200) / this.durationOfLoop
        // TODO: check if window is open before doing this:
        this.updateProgressLine(percentage)
        while (this.measureTime < currentTime + 0.200) 
        {
            for (const { x, y } of this.controller.points)
            {
                const autoTime = this.measureTime + x * this.durationOfLoop
                this.volumeNode.gain.linearRampToValueAtTime(y, autoTime)
            }
            this.nextMeasure()
        }
    }
}
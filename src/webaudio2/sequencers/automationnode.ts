






import { createSubdivSelect } from "../../nunigraph/view/create_subdivselect.js"
import { AutomationPointsEditor } from "../../UI_library/components/automation_editor.js"
import { VolumeNodeContainer } from "../volumenode_container.js"

export class AutomationNode extends VolumeNodeContainer {
    ctx : AudioContext
    nMeasures = 1
    currentPoint = 0
    startTime = 0
    measureTime = 0
    phaseShift = 0
    isPlaying = true
    tempo = 120

    private controller = new AutomationPointsEditor()

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
    }

    getController(ancestor : HTMLElement) {
        const controller = E('div')
        const thiS = this
        const subdivSelect = createSubdivSelect(
            { 
                get subdiv() { return thiS.nMeasures }
            , 
                set subdiv(value) { 
                    thiS.nMeasures = 1 / value
                }
            }, { allowFree: true })

        controller.append(this.controller.getController(ancestor), subdivSelect)

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
        this.measureTime = 0
        this.currentPoint = 0
        this.startTime = 0 // this.isInSync ? 0 : this.ctx.currentTime + 0.005
    }
    
    stop() {
        this.volumeNode.gain.cancelScheduledValues(0)
        this.isPlaying = false
    }


    nextMeasure(durationOfLoop : number) {
        this.currentPoint++
        if (this.currentPoint >= this.controller.points.length) this.currentPoint = 0
        this.measureTime += durationOfLoop
    }

    scheduleNotes() {
        if (!this.isPlaying) return;
        const time = this.ctx.currentTime
        const currentTime = time - this.startTime
        const durationOfLoop = (60*4 / this.tempo) * this.nMeasures
        while (this.measureTime < currentTime + 0.200) 
        {
            for (const { x, y } of this.controller.points)
            {
                const autoTime = this.measureTime + x * durationOfLoop
                this.volumeNode.gain.linearRampToValueAtTime(y, autoTime)
            }

            this.nextMeasure(durationOfLoop)
        }
    }
}
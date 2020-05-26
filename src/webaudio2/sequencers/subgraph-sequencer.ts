






import { NuniGraphNode } from "../../nunigraph/nunigraph_node.js"
import { Adsr, ADSR_Controller } from '../adsr.js'
import AdsrSplitter from "../adsr-splitter.js"
import { AudioContext2 } from '../webaudio2.js' 
import { G } from "../../nunigraph/init.js"






export class SubgraphSequencer extends AdsrSplitter {
    /**
     * This creates an N-step sequencer out of
     * whatever inputs are connected to it.
     */
    ctx : AudioContext2
    nSteps : number
    stepMatrix : Indexable<boolean[]>
    mutedChannel : Indexable<boolean>
    soloChannel? : number
    currentStep : number
    startTime : number
    noteTime : number
    isPlaying : boolean
    tick : number
    windowIsOpen : boolean
    HTMLGrid : HTMLElement
    private HTMLBoxes : Indexable<HTMLElement>

    constructor(ctx : AudioContext2) {
        super(ctx)
        this.ctx = ctx
        this.nSteps = 6
        this.stepMatrix = {}
        this.mutedChannel = {}
        this.currentStep = 
        this.startTime = 
        this.noteTime = 0
        this.isPlaying = false
        this.tick = (this.ctx.tempo / 60) / this.nSteps
        this.windowIsOpen = false
        this.HTMLGrid = E('div')
        this.HTMLBoxes = {}
        this.refresh()
    }

    addInput(node : NuniGraphNode) {
        const adsr = this.ADSRs[node.id] = new Adsr(this.ctx)
        adsr.gain.value = 0
        node.audioNode.connect(adsr)
        adsr.connect(this.volumeNode)
        this.stepMatrix[node.id] = Array(this.nSteps).fill(0)
        this.refresh()
    }

    removeInput(node : NuniGraphNode) {
        this.ADSRs[node.id].disconnect()
        delete this.ADSRs[node.id]
        delete this.stepMatrix[node.id]
        this.refresh()
    }

    updateTempo() {
        this.tick = (this.ctx.tempo / 60) / this.nSteps
    }

    updateSteps(nSteps : number) {
        const m = this.stepMatrix 
        for (const key in m) {
            if (m[key].length < nSteps) {
                // We need to add steps
                m[key] = m[key].concat([...Array(nSteps - m[key].length)].fill(0))
            } else {
                m[key] = m[key].slice(0, nSteps)
            }
        }
        this.nSteps = nSteps
    }

    play() {
        this.isPlaying = true
        this.noteTime = 0
        this.currentStep = 0
        this.startTime = this.ctx.currentTime + 0.01
        this.scheduleNotes()
    }

    scheduleNotes() {
        if (!this.isPlaying) return;
        const currentTime = this.ctx.currentTime - this.startTime
        
        let updateBox = true
        while (this.noteTime < currentTime + 0.200) {
            
            const patternTime = this.noteTime + this.startTime

            this.playStepsAtTime(patternTime, updateBox)
            updateBox = false
            this.nextNote()
        }
        setTimeout(() => this.scheduleNotes(), 999 * this.tick)
    }

    nextNote() {
        this.currentStep++
        if (this.currentStep >= this.nSteps) this.currentStep = 0
        this.noteTime += this.tick
    }

    playStepsAtTime(time : number, updateBox : boolean) {
        for (const key in this.ADSRs) {
            const adsr = this.ADSRs[key]
            const stepIsActive = this.stepMatrix[key][this.currentStep]
            if (!this.mutedChannel[key]) {

                if (this.HTMLGrid.offsetParent != null) {
                    if (updateBox) {
                        // Highlight box
                        this.HTMLBoxes[`${key}:${this.currentStep}`].classList.toggle('highlighted', true)
                        const lastStep = (this.currentStep === 0 ? this.nSteps : this.currentStep) - 1
                        this.HTMLBoxes[`${key}:${lastStep}`].classList.toggle('highlighted', false)
                    }
                }

                if (stepIsActive) {
                    ADSR_Controller.trigger(adsr.gain, time)
                    ADSR_Controller.untriggerAdsr(adsr.gain, time + this.tick / 2.0)
                }
            }
        }
    }

    stop() {
        this.isPlaying = false
    }

    refresh() {
        this.isPlaying = false
        this.currentStep = 0
        this.gridSetup()
    }

    gridSetup() {
        this.HTMLGrid.innerHTML = ''
        this.HTMLBoxes = {}
        const grid = this.HTMLGrid
        const { nSteps, ADSRs } = this
        for (const key in ADSRs) {
            const row = E('span')
            row.classList.add('flex-center')
            for (let i = 0; i < nSteps; i++) {
                const box = E('span')
                this.HTMLBoxes[`${key}:${i}`] = box
                box.classList.add('note-box')
                box.classList.toggle('selected', this.stepMatrix[key][i])
                box.onclick = () => {
                    const on = box.classList.toggle('selected')
                    this.stepMatrix[key][i] = on
                }
                row.appendChild(box)
            }
            grid.appendChild(row)
        }
    }
}

class SequencerRenderer {
    constructor() {

    }
}







import KB from "../note_in/keyboard.js"
import { ADSR_Controller } from "../adsr.js"
import Sequencer from "./sequencer.js"
import NuniAudioParam from "../nuni_audioparam.js"
import BufferStorage from "../../storage/general/buffer_storage.js"



type NoteOptions = { 
    bufferKey : number,
    loop? : boolean
    }

export default class BufferSequencer extends Sequencer {

    nextId : number
    loop : boolean
    bufferKey : number
    detune : NuniAudioParam
    playbackRate : NuniAudioParam

    constructor(ctx : AudioContext) {
        super(ctx)
        this.nextId = 0
        this.loop = false
        this.bufferKey = 0
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)

    }

    addInput() {
        const adsr = this.ADSRs[++this.nextId] = new GainNode(this.ctx)
        adsr.gain.value = 0
        adsr.connect(this.volumeNode)
        this.stepMatrix[this.nextId] = Array(this.nSteps).fill(0)
        this.refresh()
    }

    removeInput() {
        if (this.nextId === 0) return;
        const id = this.nextId--
        this.ADSRs[id].disconnect()
        delete this.ADSRs[id]
        delete this.stepMatrix[id]
        this.refresh()
    }

    createSource(options : NoteOptions) {
        const src = this.ctx.createBufferSource()

        // src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        src.buffer = BufferStorage.get(options.bufferKey)
        src.loop = options.loop ?? false

        return src
    }

    playStepAtTime(id : string, time : number) { // }, duration : number) {

        const duration = this.tick

        // const noteData = this.noteMatrix[id][this.currentStep]

        const src = this.createSource({ bufferKey: this.bufferKey })
        const key = 'Q'.charCodeAt(0) // noteData.keyIndex

        // src.detune.value = KB.scale[KB.keymap[key]]

        // const adsr = this.ADSRs[id]
        const adsr = new GainNode(this.ctx)
        adsr.gain.setValueAtTime(0.5, 0)
        adsr.connect(this.volumeNode)
        
        src.connect(adsr)
        ADSR_Controller.triggerSource(src, adsr.gain, time)
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time + duration)
        src.stop(stopTime)
    }

}
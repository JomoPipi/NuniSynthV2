






import { ADSR_Controller } from "../adsr.js"
import Sequencer from "./sequencer.js"
import NuniAudioParam from "../nuni_audioparam.js"
import BufferStorage from "../../storage/general/buffer_storage.js"
import { BufferUtils } from "../../buffer_utils/internal.js"



type NoteOptions = { 
    bufferKey : number,
    loop? : boolean
    }

export default class BufferSequencer extends Sequencer {

    nextId : number
    detune : NuniAudioParam
    playbackRate : NuniAudioParam

    constructor(ctx : AudioContext) {
        super(ctx)
        this.nextId = 0
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)
        this.addInput()
    }

    // setPattern(matrix : Indexable<boolean[]>) {
    //     this.stepMatrix = {}
    //     this.nextId = 0
    //     for (const key in matrix) {
    //         this.addInput(matrix[key])
    //     }
    //     this.refresh()
    // }

    addInput() {
        this.channelData[this.nextId] = {
            volume: 0.0001,
            bufferKey: 0
            }
        this.stepMatrix[this.nextId] = Array(this.nSteps).fill(0)
        this.nextId++
        this.refresh()
    }

    removeInput() {
        if (this.nextId === 0) return;
        const id = --this.nextId
        delete this.channelData[id]
        delete this.stepMatrix[id]
        this.refresh()
    }

    createSource(id : string) {
        const { 
            bufferKey
            } = this.channelData[id]

        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        src.buffer = BufferStorage.get(bufferKey!)
        // src.loop = loop ?? false

        return src
    }

    playStepAtTime(id : string, time : number) { // }, duration : number) {

        const duration = this.tick

        // const noteData = this.noteMatrix[id][this.currentStep]

        const src = this.createSource(id)
        // const key = 'Q'.charCodeAt(0) // noteData.keyIndex
        // src.detune.value = KB.scale[KB.keymap[key]]

        const { 
            volume
            } = this.channelData[id]

        log('volume =', volume)

        const adsr = new GainNode(this.ctx)
        adsr.gain.setValueAtTime(0, 0)
        adsr.connect(this.volumeNode)
        
        src.connect(adsr)
        ADSR_Controller.triggerSource(src, adsr.gain, time, volume, this.adsrIndex)
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(adsr.gain, time + duration, this.adsrIndex)
        src.stop(stopTime)
    }

    additionalRowItems(key : string) { 
        
        const box = E('span')
        const valueText = E('span')
            valueText.innerText = 
                String.fromCharCode(65 + this.channelData[key].bufferKey!)

        add_buffer_select: {
            ;['-','+'].forEach((op,i) => { // change the buffer index
                const btn = E('button'); btn.innerText = op
                btn.classList.add('top-bar-btn')
                btn.onclick = () => {
                    const v = clamp(0, 
                        this.channelData[key].bufferKey! + Math.sign(i - .5), 
                        BufferUtils.nBuffers-1)

                    valueText.innerText = String.fromCharCode(65 + v)
                    this.channelData[key].bufferKey = v
                }
                box.appendChild(btn)
            })
            box.appendChild(valueText)
        }

        return box
    }
}
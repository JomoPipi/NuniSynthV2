






import { ADSR_Controller } from "../../adsr/adsr.js"
import { Sequencer } from "../../sequencers/linear_sequencers/sequencer.js"
import { BufferStorage } from "../../../storage/buffer_storage.js"
import { BufferUtils } from "../../../buffer_utils/init_buffers.js"
import { SampleSelectComponent } from "../../../UI_library/components/sample_select.js"




export class SampleSequencer extends Sequencer
    implements AudioNodeInterfaces<NodeTypes.S_SEQ> {

    detune : NuniAudioParam
    playbackRate : NuniAudioParam
    ctx : AudioContext
    private channelBufferKeyUpdate 
        : Record<number, (bufferKey : number) => void> 
        = {}

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.detune = new NuniAudioParam(ctx)
        this.playbackRate = new NuniAudioParam(ctx)
        this.addInput()
    }

    // setPattern(matrix : Indexable<boolean[]>) {
    //     this.stepMatrix = {}
    //     this.nextId = 0
    //     for (const key in matrix) 
    //     {
    //         this.addInput(matrix[key])
    //     }
    //     this.refresh()
    // }

    refreshBuffer(index : number) {
        for (const key in this.channelData)
        {
            if (this.channelData[key].bufferKey === index)
            {
                this.setBufferKey(+key, index)
            }
        }
    }

    createChannelVolume(id : number) {
        this.channelVolumes[id] = this.ctx.createGain()
        this.channelVolumes[id].connect(this.volumeNode)
        this.channelVolumes[id].gain.value = 1
        return this.channelVolumes[id]
    }

    addInput() {
        const id = Math.max(0, ...Object.keys(this.channelData).map(Number)) + 1
        this.channelData[id] = { volume: 1, bufferKey: 0 }
        this.stepMatrix[id] = this.createStepRow()
        this.createChannelVolume(id)
        this.refresh()
        return id
    }

    removeInput(key : number) {
        delete this.channelData[key]
        delete this.stepMatrix[key]
        delete this.channelVolumes[key]
        this.refresh()
    }

    createSource(id : number) {

        const { bufferKey } = this.channelData[id]
        const src = this.ctx.createBufferSource()

        src.playbackRate.setValueAtTime(0, this.ctx.currentTime)
        this.detune.connect(src.detune)
        this.playbackRate.connect(src.playbackRate)
        src.buffer = BufferStorage.get(bufferKey!)
        // src.loop = // loop || false
        // src.start(0)

        return src
    }

    playStepAtTime(id : number, time : number) { // }, duration : number) {

        if (!this.channelVolumes[id]) 
        {
            log(':: chvolumes,chdata =',Object.keys(this.channelVolumes), Object.keys(this.channelData))
            console.log('done the dirty work?', this.hasDoneTheDirtyWork)
            const remark = 'Okay, then. Go finish the dirty work first!'
            return;
        }
        const duration = this.tick

        const src = this.createSource(id)
        // const key = 'Q'.charCodeAt(0) // noteData.keyIndex
        // src.detune.value = KB.scale[KB.keymap[key]]

        const adsr = new GainNode(this.ctx)
        adsr.gain.setValueAtTime(0, 0)

        adsr.connect(this.channelVolumes[id])
        
        // Connect the source to the envelope
        src.connect(adsr)
        src.start(time)

        // Schedule the envelope on
        ADSR_Controller.triggerSource(src, adsr.gain, time, this.adsrIndex, this.localADSR)

        // Schedule the envelope off
        const stopTime = ADSR_Controller.untriggerAndGetStopTime(
            adsr.gain, 
            time + duration, 
            this.adsrIndex,
            this.localADSR)
            
        src.stop(stopTime)
    }

    setBufferKey(channelKey : number, bufferKey : number) {
        this.channelBufferKeyUpdate[channelKey]  &&
        this.channelBufferKeyUpdate[channelKey](bufferKey)
    }

    protected additionalRowItems(key : number) : HTMLElement[] { 
        const items : HTMLElement[] = []

        const deleteRowBtn = E('button',
            { text: '🗑️ '
            , className: 'nice-btn push-button'
            })
            
        deleteRowBtn.onclick = () => this.removeInput(key)
        
        items.push(deleteRowBtn)

        AddASampleCanvas: {
            const update = (bufferKey : number) => 
                this.channelData[key].bufferKey = bufferKey
            const sampleCanvas = 
                new SampleSelectComponent(update, this.channelData[key].bufferKey!)

            this.channelBufferKeyUpdate[key] = sampleCanvas.setImage.bind(sampleCanvas)
            items.push(sampleCanvas.html)
        }

        return items
    }
}


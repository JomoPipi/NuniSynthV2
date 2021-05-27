






import { ADSR_Executor } from '../../adsr/adsr.js'
import { Sequencer } from '../../sequencers/linear_sequencers/sequencer.js'

export class GateSequencer extends Sequencer
    implements AudioNodeInterfaces<NodeTypes.G_SEQ> {

    /**
     * This creates an N-step sequencer out of
     * whatever inputs are connected to it.
     */
    private channelEnvelopes : Indexable<GainNode> = {}

    addInput({ id, audioNode } : NuniNode) {

        this.channelData[id] = { volume: 1 }
        const adsr = this.channelEnvelopes[id] = new GainNode(this.ctx)
        this.channelVolumes[id] = this.ctx.createGain()
        this.channelVolumes[id].connect(this.volumeNode)
        this.channelVolumes[id].gain.value = 1
        adsr.gain.value = 0
        audioNode.connect(adsr)
        adsr.connect(this.channelVolumes[id])
        this.stepMatrix[id] = this.createStepRow()
        this.refresh()
    }

    removeInput({ id } : NuniNode) {
        this.channelEnvelopes[id].disconnect()
        this.channelVolumes[id].disconnect()
        delete this.channelEnvelopes[id]
        delete this.channelData[id]
        delete this.channelVolumes[id]
        delete this.stepMatrix[id]
        delete this.mutedChannel[id]
        this.refresh()
    }

    hasInput({ id } : NuniNode) {
        return id in this.channelVolumes
    }

    refresh() {
        for (const key in this.channelEnvelopes) 
        {
            this.channelEnvelopes[key].connect(this.channelVolumes[key])
        }
        Sequencer.prototype.refresh.call(this)
    }

    playStepAtTime(id : number, time : number) {  

        // AD : Overlap-toggle

        const adsr = this.channelEnvelopes[id]
        const gain = adsr.gain
        const duration = this.tick
        ADSR_Executor.trigger(gain, time, this.adsrIndex, this.localADSR)
        ADSR_Executor.untriggerAdsr(gain, time + duration, this.adsrIndex, this.localADSR)
    }
    
    replaceInput({ id, audioNode } : NuniNode, newNode : NuniNode) {

        this.addInput(newNode)

        this.channelData[newNode.id] = this.channelData[id]
        this.stepMatrix[newNode.id] = this.stepMatrix[id]
        this.mutedChannel[newNode.id] = this.mutedChannel[id]

        this.removeInput({ id, audioNode })
    }
}
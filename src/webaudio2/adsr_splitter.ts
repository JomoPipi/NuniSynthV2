






import { Adsr } from "./adsr.js"
import NuniAudioParam from "./nuni_audioparam.js"







export type Destination = AudioNode | AudioParam | NuniAudioParam | AdsrSplitter

export default class AdsrSplitter {
    
    /**
     * Methods that NuniSourceNode and SubgraphSequencer need.
     */

    ctx : AudioContext
    ADSRs : Indexable<Adsr>
    volumeNode : GainNode

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.ADSRs = {}
        this.volumeNode = ctx.createGain()
    }
    
    connect(destination : Destination) {
        this.connection(true, destination)
        this.refresh()
    }

    disconnect(destination? : Destination) {
        if (!destination) {
            this.volumeNode.disconnect()
            for (const key in this.ADSRs) {
                this.ADSRs[key].connect(this.volumeNode)
            }
            return;
        }
        this.connection(false, destination)
        this.refresh()
    }

    protected connection(on : boolean, d : Destination) {
        const dest = d instanceof NuniAudioParam ? d.offset : d as AudioParam
        if (on) {
            this.volumeNode.connect(dest) 
        } else {
            this.volumeNode.disconnect(dest)
        }
    }

    refresh() {
        throw 'This should be implemented in a child class.'
    }
}
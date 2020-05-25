import { Adsr } from "./adsr.js"
import { Destination, NuniSourceAudioParam } from "./nuni_source_node.js"







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
        const dest = d instanceof NuniSourceAudioParam ? d.src.offset : d as any
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
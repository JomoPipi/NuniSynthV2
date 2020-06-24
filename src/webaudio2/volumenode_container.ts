






import NuniAudioParam from "./nuni_audioparam.js"




export type Destination = AudioNode | AudioParam | NuniAudioParam | VolumeNodeContainer




export default class VolumeNodeContainer {
    
    /**
     * Methods that NuniSourceNode and SubgraphSequencer need.
     */

    ctx : AudioContext
    volumeNode : GainNode

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.volumeNode = ctx.createGain()
        this.volumeNode.gain.value = 1
    }
    
    connect(destination : Destination) {
        this.connection(true, destination)
    }

    disconnect(destination? : Destination) {
        if (!destination) {
            this.volumeNode.disconnect()
            return;
        }
        this.connection(false, destination)
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
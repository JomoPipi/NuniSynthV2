






export class VolumeNodeContainer {
    
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
    
    connect(destination : AudioNode | AudioParam) {
        this.volumeNode.connect(destination as any) //***
    }

    disconnect(destination? : AudioNode | AudioParam) {
        if (!destination) {
            this.volumeNode.disconnect()
            return;
        }
        this.volumeNode.disconnect(destination as any) //***
    }

    // *** - these need 'any' because of `tsc -w`

    refresh() {
        throw 'This should be implemented in a child class.'
    }
}
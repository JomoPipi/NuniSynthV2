






export class VolumeNodeContainer {
    
    /**
     * Methods that NuniSourceNode and GateSequencer need.
     */

    ctx : AudioContext
    volumeNode : GainNode

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.volumeNode = ctx.createGain()
        this.volumeNode.gain.value = 1
    }

    connect(destination : Destination) {
        this.volumeNode.connect(destination)
    }

    disconnect(destination? : Destination) {
        if (!destination) 
        {
            this.volumeNode.disconnect()
            return;
        }
        this.volumeNode.disconnect(destination as AudioNode) //***
    }

    // *** - these need 'any' because of `tsc -w`

    refresh() {
        throw 'This should be implemented in a child class.'
    }
}
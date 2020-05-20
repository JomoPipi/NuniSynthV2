






import { bufferController } from '../nunigraph/init.js'
import { NuniSourceNode, AudioParam2 } from './nuni_source_node.js'
import { ADSR_Controller } from './adsr.js'
import { KB } from './keyboard.js'

export class BufferNode2 extends NuniSourceNode {
    /**
     * audioBufferSourceNodes need to get disconnected
     * as keys get pressed/unpressed.
     * The sampler will take care of this business internally
     * while keeping the node connected to the graph.
     */

    loop : boolean
    bufferIndex : number
    detune : AudioParam2
    playbackRate : AudioParam2
    
    constructor(ctx : AudioContext) {
        super(ctx)

        this.loop = true
        this.bufferIndex = 0
        this.detune = new AudioParam2(ctx)
        this.playbackRate = new AudioParam2(ctx)

        this.setKbMode('none')
    }

    prepareBuffer(key : number) { // happens at noteOff
        const sources = this.sources

        sources[key] && sources[key].disconnect()
        const src = sources[key] = this.ctx.createBufferSource()
        src.playbackRate.setValueAtTime(0,this.ctx.currentTime)

        this.detune.src.connect(src.detune)
        this.playbackRate.src.connect(src.playbackRate)

        if (key !== this.MONO) {
            src.detune.value = KB.scale[KB.keymap[key]]
        }

        src.buffer = bufferController.buffers[this.bufferIndex]
        src.loop = this.loop
        
        src.connect(this.ADSRs[key])
    }

    private connectBuffer(key : number) {
        const src = this.sources[key] 
        if (!src.hasStarted) {
            src.hasStarted = true
            src.start(this.ctx.currentTime)
        }
    }

    protected noteReallyOn(key : number) {
        const adsr = this.ADSRs[key]

        if (adsr.releaseId >= 0) {
            clearInterval(adsr.releaseId)
            adsr.releaseId = -1
            this.prepareBuffer(key)
        }
        
        ADSR_Controller.trigger(adsr.gain, this.ctx.currentTime)
        this.connectBuffer(key)
    }

    refresh() {
        if (this.kbMode === 'poly') {
            KB.keyCodes.forEach(key => 
                this.prepareBuffer(key))

        } else if (this.kbMode === 'mono') {
            this.prepareBuffer(this.MONO)

        } else if (this.kbMode === 'none') {
            this.prepareBuffer(this.MONO) 
            this.connectBuffer(this.MONO)
        }
        else throw 'How could such a thing be?'
    }
}
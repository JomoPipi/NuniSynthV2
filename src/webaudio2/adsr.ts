






import { NuniSourceNode } from './note_in/nuni_source_node.js'

interface SourceNode {
    start : (when : number) => void;
    stop : (when : number) => void;
}

export class Adsr extends GainNode {
    /**
     * The only purpose of this class right now is 
     * to add the property lastReleastId to GainNodes.
     * 
     * releaseId is -1 when the adsr is not in the release stage,
     * and some other number, otherwise.
     */
    releaseId : number
    constructor(ctx : AudioContext) {
        super(ctx)
        this.releaseId = -1
    }
}

export const ADSR_Controller = {
    canvas: D('adsr-canvas')! as HTMLCanvasElement,

    attack: 0.010416984558105469, 
    decay: 0.17708349227905273, 
    sustain: 0.2166603088378906, 
    release: 0.3812504768371582,

    trigger: function(gain : AudioParam, time : number) {
        const { attack, decay, sustain } = this
        gain.cancelScheduledValues(time)                          // Cancel existing triggers
        gain.setTargetAtTime(1, time, attack)                     // Attack phase
        gain.setTargetAtTime(sustain ** 2, time + attack, decay)  // Decay phase
    },

    
    triggerSource: function(source : SourceNode, gain : AudioParam, time : number) {
        const { attack, decay, sustain } = this
        gain.cancelScheduledValues(time)                          // Cancel existing triggers
        gain.setTargetAtTime(1, time, attack)                     // Attack phase
        gain.setTargetAtTime(sustain ** 2, time + attack, decay)  // Decay phase
        source.start(time)
    },

    untriggerSource: function(source : SourceNode, gain : AudioParam, time : number) {
        const { release } = this
        gain.cancelScheduledValues(time)
        gain.setTargetAtTime(0, time, release)
        source.stop(time + release * 10)
    },

    untriggerAdsr: function(gain : AudioParam, time : number) {
        const { release } = this
        gain.cancelScheduledValues(time)
        gain.setTargetAtTime(0, time, release)
    },

    untrigger: function(sourceNode : NuniSourceNode, key : number) {
        const { release } = this
        const t = sourceNode.ctx.currentTime
        const adsr = sourceNode.ADSRs[key]
        const gain = adsr.gain

        gain.cancelScheduledValues(t)
        gain.setTargetAtTime(0, t, release)
        
        adsr.releaseId = window.setTimeout(() => {

            adsr.releaseId = -1
            sourceNode.prepareSource(key)

        }, 10 * release * 1000)
        // Why 10 * relase ? It gives the `gain.setTargetAtTime(0, t, release)`
        // call enough time to get the volume down by ~99.995%, according to
        // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime#Choosing_a_good_timeConstant
    },
    render: () => {}
}

{
    const adsr = ADSR_Controller
    const isAux = false // s === 'aux-'        
    const ctx = adsr.canvas.getContext('2d')!
    
    adsr.render = function () {
        const H = this.canvas.height, W = this.canvas.width
        ctx.lineWidth = 5

        const sum = this.attack + this.decay + 0.25 + this.release
        const adsrWidths = [
            this.attack  / sum,
            this.decay   / sum,
            0.25         / sum,
            // Release is done by default
        ]
        const [aw,dw,sw] = adsrWidths

        const t1 = aw
        const t2 = t1 + dw
        const t3 = t2 + sw
        const t4 = 1
        const margin = 5

        const arr = [
            [t1, 0],
            [t2, 1 - this.sustain],
            [t3, 1 - this.sustain],
            [t4, 1]
        ]

        if (isAux) {
            // The only difference between ADSR and AD.
            // I know it's not currently being used, 
            // but I don't want to delete this.
            arr[1][1] = 1
            arr[2] = arr[3]
        }

        ctx.clearRect(0,0,W,H)
        let lastX = margin, lastY = H - margin
        arr.forEach(([x,y],i) => {
            ctx.beginPath()
            ctx.moveTo(lastX, lastY)
            ctx.strokeStyle = '#8a8,#a88,#88a,#a8a'.split(',')[i]
            ctx.lineTo(
                lastX = x * (W - margin * 2) + margin, 
                lastY = y * (H - margin * 2) + margin 
            )
            ctx.stroke() 
            ctx.closePath()
        })
        ctx.closePath()
    }

    adsr.render()
}
 
{
    const knobs = D('adsr-knobs')!
    'attack,decay,sustain,release'.split(',').forEach(s => {
        const dial = new JsDial()
        const adsr = ADSR_Controller as Indexed
        
        dial.value = adsr[s]
        dial.render()
        dial.attach((value : number) => {
            adsr[s] = value * value
            ADSR_Controller.render()
        })
        knobs.appendChild(dial.html)
    })
}







class Adsr extends GainNode {
    /**
     * The only purpose of this class right now is 
     * to add the property lastReleastId to GainNodes.
     * 
     * releaseId is -1 when the adsr is not in the release stage,
     * and some other number, otherwise.
     */
    releaseId : number
    constructor(ctx : AudioContext2) {
        super(ctx)
        this.releaseId = -1
    }
}

const ADSR_Controller = {
    canvas: D('adsr-canvas'),

    attack: 0.010416984558105469, 
    decay: 0.17708349227905273, 
    sustain: 0.2166603088378906, 
    release: 0.3812504768371582,

    trigger: function(gain : AudioParam, t : number) {
        const { attack, decay, sustain } = this
        gain.cancelScheduledValues(t)                          // Cancel existing triggers
        gain.setTargetAtTime(1, t, attack)                     // Attack phase
        gain.setTargetAtTime(sustain ** 2, t + attack, decay)  // Decay phase
    },

    untrigger: function(sourceNode : NuniSourceNode, key : number) {
        const { release } = this
        const lowVol = 0.001
        const t = sourceNode.ctx.currentTime
        const adsr = sourceNode.ADSRs[key]
        const gain = adsr.gain

        gain.cancelScheduledValues(t)
        gain.setTargetAtTime(0, t, release)
        
        let lastGain = -Infinity
        adsr.releaseId = window.setInterval(() => {
            
            /** Repeat may happen because an audio buffer may end before
             *  the release phase begins. And that seemed to cause a 
             *  problem.
             * */ 
            const repeat = lastGain === gain.value
            lastGain = gain.value

            if (gain.value <= lowVol || repeat) { // to completely turn it off
                gain.cancelScheduledValues(t)
                gain.setValueAtTime(0, sourceNode.ctx.currentTime)
                
                clearInterval(adsr.releaseId) 
                adsr.releaseId = -1

                if (sourceNode instanceof BufferNode2) {
                    sourceNode.prepareBuffer(key)
                }
            }
        }, 40)
    },
    render: () => void 0
}

// const aux_ADSR = {
//     attack: 0.010416984558105469, 
//     decay: 0.17708349227905273, 
//     sustain: 0.2166603088378906, 
//     release: 0.4812504768371582,
// }
{
    // Attach render function to ADSR_Controller

    ;[/*['aux-',aux_ADSR],*/['',ADSR_Controller]].forEach(([s,adsr] : any) => { 

        const isAux = s === 'aux-'        
        const ctx = adsr.canvas.getContext('2d')
        
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
    })
}

{
    // Attach JS dials to ADSR
    MY_JS_DIALS.forEach((dial : JsDial) => {
        const id = dial.id as string
        if (id.includes('adsr')) 
        {
            const adsr = ADSR_Controller as Indexed
            const s = id.split('-')[1]
            dial.value = adsr[s]
            dial.render()
            dial.attach((x : number) => {
                adsr[s] = x * x
                ADSR_Controller.render()
            })

        } else {
            throw 'Check what JsDials you have.'
        }
    })
}
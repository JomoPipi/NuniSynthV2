






class Adsr extends GainNode {
    /**
     * The only purpose of this class right now is 
     * to add the property lastReleastId to GainNodes.
     * 
     * releaseId is -1 when the adsr is not in the release stage,
     * and something else, otherwise.
     */
    releaseId : number
    constructor(ctx : AudioContext2) {
        super(ctx)
        this.releaseId = -1
    }
}

const ADSR = {
    attack: 0.010416984558105469, 
    decay: 0.17708349227905273, 
    sustain: 0.2166603088378906, 
    release: 0.3812504768371582,
    canvas: document.getElementById('adsr-canvas'),

    trigger: function(gain : AudioParam, t : number) {
        const { attack, decay, sustain } = this
        gain.cancelScheduledValues(t)                          // cancel existing triggers
        gain.setValueAtTime(0,t)                               // this needs to be disabled to allow mono-glide
        gain.setTargetAtTime(1, t, attack)                     // attack phase
        gain.setTargetAtTime(sustain ** 2, t + attack, decay)  // decay phase
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
        adsr.releaseId = setInterval(() => {
            
            /** Repeat may happen because an audio buffer may end before
             *  the release phase begins. And that seemed to cause a 
             *  problem.
             * */ 
            const repeat = lastGain === gain.value
            lastGain = gain.value

            if (gain.value <= lowVol || repeat) { // to completely turn it off
                gain.cancelScheduledValues(t)
                
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
    // create render functions for these ADSR's

    ;[/*['aux-',aux_ADSR],*/['',ADSR]].forEach(([s,adsr] : any) => { 

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
                // release is done by default
            ]
            const [aw,dw,sw] = adsrWidths

            const t1 = aw
            const t2 = t1 + dw
            const t3 = t2 + sw
            const t4 = 1
            const margin = 20

            const arr = [
                [t1, 0],
                [t2, 1 - this.sustain],
                [t3, 1 - this.sustain],
                [t4, 1]
            ]

            if (isAux) {
                // the only difference between ADSR and AD
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
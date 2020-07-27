






import { JsDial, createRadioButtonGroup } from "../UI_library/internal.js"







interface SourceNode {
    start : (when : number) => void
    stop : (when : number) => void
}


// Why 10 ? It gives the `gain.setTargetAtTime(0, t, release)`
// call enough time to get the volume down by ~99.995%, according to
// https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime#Choosing_a_good_timeConstant
const releaseTimeConstant = 10

// const waveArray = new Float32Array(9);
// waveArray[0] = 0.5;
// waveArray[1] = 1;
// waveArray[2] = 0.5;
// waveArray[3] = 0;
// waveArray[4] = 0.5;
// waveArray[5] = 5;
// waveArray[6] = 0.5;
// waveArray[7] = 0;
// waveArray[8] = 0.5;

const N_ADSRs = 4

const defaultADSR = () => (
    { attack: 0.010416984558105469
    , decay: 0.17708349227905273
    , sustain: 0.2166603088378906
    , release: 0.3812504768371582
    })

export const ADSR_Controller = {
    canvas: D('adsr-canvas') as HTMLCanvasElement,

    index: 0,

    values: [...Array(N_ADSRs)].map(defaultADSR),

    trigger: function(gain : AudioParam, time : number, volume : number, adsrIndex : number) {
        const { attack, decay, sustain } = this.values[adsrIndex]
        gain.cancelScheduledValues(time)                                  // Cancel existing triggers
        gain.setTargetAtTime(volume, time, attack)                        // Attack phase
        gain.setTargetAtTime(volume * sustain ** 2, time + attack, decay) // Decay phase
        // gain.setValueCurveAtTime(waveArray, time, 1)
    },

    
    triggerSource: function(source : SourceNode, gain : AudioParam, time : number, volume : number, index? : number) {
        const { attack, decay, sustain } = this.values[index ?? this.index]
        gain.cancelScheduledValues(time)                                  // Cancel existing triggers
        gain.setTargetAtTime(volume, time, attack)                        // Attack phase
        gain.setTargetAtTime(volume * sustain ** 2, time + attack, decay) // Decay phase
        source.start(time)
    },

    untriggerAdsr: function(gain : AudioParam, time : number, index? : number) {
        const { release } = this.values[index ?? this.index]
        gain.cancelScheduledValues(time)
        gain.setTargetAtTime(0, time, release)
    },

    untriggerAndGetStopTime: function(gain : AudioParam, time : number, index? : number) {
        const { release } = this.values[index ?? this.index]
        gain.cancelScheduledValues(time)
        gain.setTargetAtTime(0, time, release)
        return time + release * releaseTimeConstant
    },

    render: (options? : any) => {}
}

type RenderOptions = Partial<{ updateKnobs : boolean }>

;{
    const adsr = ADSR_Controller
    const isAux = false // s === 'aux-'        
    const ctx = adsr.canvas.getContext('2d')!
    
    adsr.render = function (options : RenderOptions = {}) {
        const H = this.canvas.height, W = this.canvas.width
        ctx.lineWidth = 5

        const { attack, decay, sustain, release } = this.values[this.index]

        const sum = attack + decay + 0.25 + release
        const adsrWidths = [
            attack  / sum,
            decay   / sum,
            0.25    / sum,
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
            [t2, 1 - sustain],
            [t3, 1 - sustain],
            [t4, 1]
        ]

        if (isAux) 
        {
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

        if (options.updateKnobs) 
        {
            updateKnobs()
        }
    }

    adsr.render()
}
 

const knobs = D('adsr-knobs')
const ADSR = 'attack,decay,sustain,release'.split(',')
const adsrDials =
    ADSR.reduce((a,s) => {
        const dial = new JsDial()
        const adsr = ADSR_Controller as Indexed
        
        dial.value = adsr.values[adsr.index][s]
        dial.sensitivity = 2 ** -10
        dial.render()
        dial.attach((value : number) => {
            adsr.values[adsr.index][s] = value * value
            adsr.render()
        })
        knobs.appendChild(dial.html)

        a[s] = dial
        return a
    }, {} as Indexable<JsDial>)
    
{ 
    D('select-adsr').appendChild(createRadioButtonGroup({
        buttons: [...'ABCD'],
        selected: 'A',
        className: 'top-bar-btn',
        onclick: (data : any, index : number) => {
            const adsr = ADSR_Controller
            adsr.index = index
            adsr.render({ updateKnobs: true })
        },
        text: 'ADSR'
    }))
}

function updateKnobs() {
    const adsr = ADSR_Controller
    for (const s of ADSR) 
    {
        adsrDials[s].update((<Indexed>adsr.values[adsr.index])[s] ** .5)
    }
}
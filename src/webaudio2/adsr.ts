






import { JsDial, createRadioButtonGroup } from "../UI_library/internal.js"







interface SourceNode {
    start : (when : number) => void
    stop : (when : number) => void
}


// Why 10 ? It gives the `gain.setTargetAtTime(0, t, release)`
// call enough time to get the volume down by ~99.995%, according to
// https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime#Choosing_a_good_timeConstant
const releaseTimeConstant = 10

const waveArray = new Float32Array(9)
waveArray[0] = 0.5
waveArray[1] = 1
waveArray[2] = 0.5
waveArray[3] = 0
waveArray[4] = 0.5
waveArray[5] = 6
waveArray[6] = 0.5
waveArray[7] = 0
waveArray[8] = 0.5

var createLogarithmicBuffer = function createLogarithmicBuffer(direction = 1, base? : number, length? : number) {
    base = base || 10,
    length = length || 100
    const curve = new Float32Array(length)
    let percent = 0,
        index,
        i;

    for (i = 0; i < length; i++) {
        //index for the curve array.
        //direction positive for fade in, negative for fade out
        index = direction > 0 ? i : length - 1 - i;

        percent = i / length;
        curve[index] = Math.log(1 + base*percent) / Math.log(1 + base);
    }

    return curve;
};
const logarUp = createLogarithmicBuffer(1)
const logarDown = createLogarithmicBuffer(-1)

const N_ADSRs = 4

type CurveType = 'linear' | 'logarithmic' | 'exponential' | 'S'

const defaultADSR = (_ : any, index : number) => {
    const x = index / 8
    return ( 
        { attack: 0.010416984558105469 + x
        , decay: 0.17708349227905273 + x
        , sustain: 0.2166603088378906 + x
        , release: 0.3812504768371582 + x
        , curve: 'exponential' as CurveType
        })
}
const squareADSR = // Needs to be somewhat smooth to prevent pop sounds
    { attack: 0.001
    , decay: 0
    , sustain: 1
    , release: 0.001
    , curve: 'S' as CurveType
    }

const canvas = D('adsr-canvas') as HTMLCanvasElement

export const ADSR_Controller = {
    canvas,

    index: 0,

    values: [...Array(N_ADSRs)].map(defaultADSR).concat([squareADSR]),

    trigger: function(gain : AudioParam, time : number, adsrIndex : number) {
        
        const adsr = this.values[adsrIndex]
        const { attack, decay, sustain, curve } = adsr
        gain.cancelScheduledValues(time)           
        
        if (curve === 'linear')
        {
            gain.linearRampToValueAtTime(0.01, time)
            gain.linearRampToValueAtTime(1, attack + time)
            gain.linearRampToValueAtTime(sustain ** 2, time + attack + decay)
        }
        else if (curve === 'exponential')
        {
            gain.exponentialRampToValueAtTime(0.01, time)
            gain.exponentialRampToValueAtTime(1, attack + time)
            gain.exponentialRampToValueAtTime(sustain ** 2, time + attack + decay)
        }
        else if (curve === 'logarithmic') {
            gain.setValueCurveAtTime(logarUp, time, attack)
            gain.setValueCurveAtTime(logarDown, time + attack, decay)
        }
        else
        {
            gain.setTargetAtTime(1, time, attack)                        // Attack phase
            gain.setTargetAtTime(sustain ** 2, time + attack, decay) // Decay phase
        }
    },

    
    triggerSource: function(source : SourceNode, gain : AudioParam, time : number, index? : number) {
        const { attack, decay, sustain } = this.values[index ?? this.index]
        gain.cancelScheduledValues(time)                                  // Cancel existing triggers
        gain.setTargetAtTime(1, time, attack)                        // Attack phase
        gain.setTargetAtTime(sustain ** 2, time + attack, decay) // Decay phase
        source.start(time)
    },

    untriggerAdsr: function(gain : AudioParam, time : number, adsrIndex? : number) {
        const adsr = this.values[adsrIndex ?? this.index]
        const { release } = adsr
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

canvas.onclick = () => {
    const adsr = ADSR_Controller.values[ADSR_Controller.index]
    const next = 
        { linear: 'logarithmic'
        , logarithmic: 'exponential'
        , exponential: 'S'
        , S: 'linear'
        , undefined: 'S' // Backwards compatibility
        } as Record<CurveType,CurveType>

    adsr.curve = next[adsr.curve]
    ADSR_Controller.render()
}

type RenderOptions = Partial<{ updateKnobs : boolean }>

;{
    const adsr = ADSR_Controller
    const isAux = false // s === 'aux-' // (aux-adsr = A and D only)
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

            lastX = x * (W - margin * 2) + margin, 
            lastY = y * (H - margin * 2) + margin
            ctx.lineTo(lastX, lastY)
            
            // ctx.quadraticCurveTo(lastX, lastY, lastX, lastY)
            // ctx.bezierCurveTo(
            //     lastX, 
            //     lastY, 
            //     lastX, 
            //     lastY, 
            //     lastX, 
            //     lastY)

            ctx.stroke() 
            ctx.closePath()
        })
        ctx.closePath()

        ctx.fillStyle = 'white'
        ctx.font = '20px arial'
        ctx.fillText(ADSR_Controller.values[ADSR_Controller.index].curve, W - 110, 20)

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
    D('select-adsr').appendChild(createRadioButtonGroup(
        { text: 'ADSR '
        , buttons: [...'ABCD']
        , selected: 'A'
        , onclick: (data : any, index : number) => {
            const adsr = ADSR_Controller
            adsr.index = index
            adsr.render({ updateKnobs: true })
        }
        , orientation: 2
        }))
}

function updateKnobs() {
    const adsr = ADSR_Controller
    for (const s of ADSR) 
    {
        adsrDials[s].update((<Indexed>adsr.values[adsr.index])[s] ** .5)
    }
}
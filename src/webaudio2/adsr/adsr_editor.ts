






import { JsDial, createRadioButtonGroup } from "../../UI_library/internal.js"
import { renderADSR } from "./adsr.js"

type CurveType = 'linear' | 'logarithmic' | 'exponential' | 'S'
type ADSRData = 
    { attack: number
    , decay: number
    , sustain: number
    , release: number
    , curve: CurveType
    }

export function createADSREditor(adsrValues : ADSRData) {
        
    const canvas = E('canvas')
        canvas.width = 56
        canvas.height = 35
        canvas.style.cursor = 'pointer' // The way to get back to global ADSRs
    const ctx = canvas.getContext('2d', { alpha: false })!
    const knobs = E('span', { className: 'flex-center' })
        knobs.style.textAlign = 'start' // This stops the knobs from shifting
    const ADSR = 'attack,decay,sustain,release'.split(',')
    const render = () =>
        renderADSR(adsrValues, ctx, canvas.height, canvas.width, { lineWidth: 2 })
    const adsrDials =
        ADSR.reduce((a : any, s : any) => {
            const dial = new JsDial()
            const adsr = adsrValues as any
            // const epsilon = 0.00002

            dial.value = adsr[s]
            dial.size = 24
            dial.sensitivity = 2 ** -10
            dial.render()
            dial.attach((value : number) => {
                adsr[s] = value * value
                // if (s === 'attack') adsr[s] = Math.max(adsr[s], epsilon)
                render()
            })
            knobs.appendChild(dial.html)

            a[s] = dial
            return a
        }, {} as Indexable<JsDial>)
    render()

    function updateKnobs() {
        const adsr = adsrValues
        for (const s of ADSR) 
        {
            adsrDials[s].update((<Indexed>adsr)[s] ** .5)
        }
    }
    updateKnobs()

    type CurveType = 'linear' | 'logarithmic' | 'exponential' | 'S'
    const next = 
        { linear: 'logarithmic'
        , logarithmic: 'exponential'
        , exponential: 'S'
        , S: 'linear'
        } as Record<CurveType,CurveType>

    const text = E('span', { text: 'ADSR' })
    canvas.onclick = () => {
        adsrValues.curve = next[adsrValues.curve]
        render()
    }

    const localADSR = E('div', 
        { children: [canvas, knobs]
        })
        localADSR.style.display = 'inline'

    const container = E('span', 
        { children: [text, localADSR]
        })

    return container
}
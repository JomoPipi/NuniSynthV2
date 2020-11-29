






import { createDraggableNumberInput, JsDial } from "../../UI_library/internal.js"







const subdivisionList = [
    1, 2, 4, 8, 16, 32, 64, 128,
    3, 6, 12, 24, 48, 96, 
    0.5, 0.25, 0.125, 0.0625
    ]
for (let i = 5; i < 64; i++) 
{
    if (!subdivisionList.includes(i)) 
    {
        subdivisionList.push(i)
    }
}

type Options = 
    { fn? : (value : number) => void 
    , allowFree? : boolean
    }

const freeTempo = 'Free'

const makeSubdivisionOption = (n : number) =>
    E('option', 
        { text: n < 1 
            ? `${Math.round(1/n)} bars` 
            : '1/' + n
        , className: 'list-btn' 
        })

export function createSubdivSelect(an : { subdivisionSynced? : boolean, subdiv : number, isInSync? : boolean }, options ?: Options) {
    const { fn, allowFree }  = options || {}
        
    const maybeFree = allowFree 
        ? [E('option', { text: freeTempo, className: 'list-btn' })] 
        : []

    const select = 
        E('select', { children: maybeFree.concat(subdivisionList.map(makeSubdivisionOption)) })

    select.style.width = select.offsetHeight + 'px'
    select.value 
        = an.subdivisionSynced
        ? freeTempo
        : an.subdiv <= 1 
        ? `${Math.round(1 / an.subdiv)} bars` 
        : '1/' + an.subdiv

    // const freeKnob = createDraggableNumberInput(
    //     an.subdiv, () => an.subdiv, 
    //     (value : number) => {
    //             an.subdiv = clamp(0.01,value,1e9)||0.01
    //             fn && fn(value)
    //         },
    //     { amount: 2**(-7)
    //     , min: 1
    //     , max: 999
    //     , isLinear: false
    //     , width: 80
    //     , height: 30 
    //     })

    const freeKnob = new JsDial(1)
        freeKnob.min = -3
        freeKnob.max = 9
        freeKnob.rounds = 1
        freeKnob.size = 20
        freeKnob.sensitivity = 2**-6
        freeKnob.html.style.display = an.subdivisionSynced ? 'inline' : 'none'
        freeKnob.attach((value : number) => {
            const v = 2 ** value
            an.subdiv = clamp(0.01, v, 1e9)||0.01
            fn && fn(v)
        })
    
    select.onchange = function() {
        if (select.value === freeTempo)
        {
            an.subdivisionSynced = true
            an.isInSync = false
            freeKnob.html.style.display = 'inline'
            freeKnob.update(an.subdiv)
            return
        }
        else 
        {
            an.subdivisionSynced = false
            freeKnob.html.style.display = 'none'
        }
        const n = select.value.endsWith('bars') 
            ? 1.0/+select.value.split(' ')[0]
            : +select.value.split('/')[1]

        an.subdiv = n
        fn && fn(n)
    }


    return E('div', { className: 'flex-center', children: [select, freeKnob.html] })
}

export function createSubdivSelect2(fn? : (value : number) => void) {

    const select = 
        E('select', { children: subdivisionList.map(makeSubdivisionOption) })

    // select.style.width = select.offsetHeight + 'px'

    select.onchange = function() {
        const n = select.value.endsWith('bars') 
            ? 1.0/+select.value.split(' ')[0]
            : +select.value.split('/')[1]

        fn && fn(n)
    }

    return E('span', { children: [select] })
}
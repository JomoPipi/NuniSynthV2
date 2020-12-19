






import { createVersatileNumberDialComponent } from "../../UI_library/components/versatile_numberdial.js"
import { JsDial } from "../../UI_library/internal.js"







const subdivisionList = [
    0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128,
    1.5, 3, 6, 12, 24, 48, 96, 
    5, 10, 15, 20, 25,
    7, 14, 21, 28,
    9, 18, 27,
    11, 13, 17, 19, 23
    ]
    
// for (let i = 5; i < 64; i++) 
// {
//     if (!subdivisionList.includes(i)) 
//     {
//         subdivisionList.push(i)
//     }
// }

type Options = 
    { fn? : (value : number) => void 
    , allowFree? : boolean
    }

const freeTempo = 'Free'

const subdivisionToString = (n : number) => 
    n <= 1 
        ? `${Math.round(1/n)} bars` 
        : '1/' + n

const makeSubdivisionOption = (n : number) =>
    E('option', 
        { text: subdivisionToString(n)
        , className: 'list-btn' 
        })

const subdivStringToNumericalValue = subdivisionList.reduce((a,value) => 
    (a[subdivisionToString(value)] = value, a) , {} as Record<string, number>)

const numericalValueToSubdivString = (value : number) => 
    subdivisionToString(subdivisionList.reduce(([closest, distance], x) => {
        const d = Math.abs(x - value)
        return d < distance ? [x, d] : [closest, distance]
    }, [1e9, 1e9])[0])

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
            : +select.value.split('/')[1];

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


type Options3 = Partial<{
    mousedown : MouseHandler
    mouseup : MouseHandler
    forceMode : 'discrete' | 'continuous'
}>

export function createSubdivSelect3(initialValue : number, updateFn : (value : number) => void, options? : Options3) {
    /** Makes use of VersatileNumberComponent */
    const innerFn = (x : number | string) => updateFn(typeof x === "number" ? x : subdivStringToNumericalValue[x])

    const numberDial = createVersatileNumberDialComponent(initialValue, subdivisionList.map(subdivisionToString),
        { fn: innerFn
        , mapStringToNumber: subdivStringToNumericalValue
        , mapNumberToString: numericalValueToSubdivString
        , continuousDial: { min: Math.min(...subdivisionList), max: Math.max(...subdivisionList) }
        , mouseup: options?.mouseup
        , forceMode: options?.forceMode
        })
        
    return { container: E('div', { /* text: 'subdiv',*/ children: [numberDial] }) }
}
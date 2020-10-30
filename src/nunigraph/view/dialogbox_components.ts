






import { createNumberDialComponent } from "../../UI_library/internal.js"







const subdivisionList = [
    1, 2, 4, 8, 16, 32, 64, 128,
    3, 6, 12, 24, 48, 96, 
    0.5, 0.25, 0.125
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

export function createSubdivSelect(an : { subdiv : number }, options ?: Options) {
    const { fn, allowFree }  = options || {}
        
    const makeSubdivisionOption = (n : number) =>
        E('option', 
            { text: n < 1 
                ? `${Math.round(1/n)} bars` 
                : '1/' + n
            , className: 'list-btn' 
            })

    const maybeFree = allowFree 
        ? [E('option', { text: 'Free', className: 'list-btn' })] 
        : []

    const select = 
        E('select', { children: maybeFree.concat(subdivisionList.map(makeSubdivisionOption)) })

    select.style.width = select.offsetHeight + 'px'
    select.value 
        = an.subdiv === 0
        ? select.value
        : an.subdiv <= 1 
        ? `${Math.round(1 / an.subdiv)} bars` 
        : '1/' + an.subdiv

    select.onchange = function() {
        // if (select.value === 'free')
        // {
        //     showFreeKnob(an.subdiv || 1, fn)
        //     an.subdiv = 0
        //     return;
        // }
        // else hideFreeKnob()

        const n = select.value.endsWith('bars') 
            ? 1.0/+select.value.split(' ')[0]
            : +select.value.split('/')[1]

        an.subdiv = n
        fn && fn(n)
    }

    // const freeKnob = createNumberDialComponent()

    return select // E('div', { children: [select, freeKnob] })
}
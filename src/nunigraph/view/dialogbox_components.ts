






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

export function createSubdivSelect(an : { subdiv : number }, fn? : (value : number) => void) {
        
    const makeSubdivisionOption = (n : number) =>
        E('option', 
            { text: n < 1 
                ? `${Math.round(1/n)} bars` 
                : '1/' + n
            , className: 'list-btn' 
            })

    const select = 
        E('select', 
        { children: subdivisionList.map(makeSubdivisionOption) })

    select.style.width = select.offsetHeight + 'px'
    select.value = an.subdiv <= 1 
        ? `${Math.round(1 / an.subdiv)} bars` 
        : '1/' + an.subdiv

    select.onchange = function() {
        const n = select.value.endsWith('bars') 
            ? 1.0/+select.value.split(' ')[0]
            : +select.value.split('/')[1]

        an.subdiv = n
        fn && fn(n)
    }

    return select
}







type RadioButtonOptions = {
    buttons : string[]
    selected : string | number
    className? : string
    text? : string
    onclick? : (data : any, index : number) => void
    containerClassName? : string
    }

export function createRadioButtonGroup(
    { buttons
    , selected
    , className
    , onclick
    , text
    , containerClassName } : RadioButtonOptions) {

    const box = E('span', 
        { text 
        , children: text ? [E('br')] : undefined
        , className: containerClassName
        })

    const btns = buttons.map((text) => 
        box.appendChild(E('button', 
            { text
            , className: className || 'top-bar-btn'
            })))

    if (typeof selected === 'number') 
    {
        const btn = btns[selected]
        if (!btn) throw 'The index is out of bounds'
        btn.classList.add('selected')
    } 
    else 
    {
        const btn = btns.find(btn => btn.innerText === selected)
        if (!btn) throw 'The string must be the name of a button.'
        btn.classList.add('selected')
    }

    box.onclick = (e : MouseEvent) => {
        const btn = e.target as HTMLButtonElement
        const index = btns.indexOf(btn)
        if (index >= 0) 
        {
            box.dataset.selected = index.toString()
            onclick && onclick(btn.innerText, index)

            for (const _btn of btns) 
            {
                _btn.classList.toggle('selected', _btn === btn)
            }
        }
    }

    return box
}







import { createSVGIcon } from "./svg_icon.js"







type RadioButtonOptions = {
    buttons : string[]
    selected : string | number
    className? : string
    text? : string
    onclick? : (data : any, index : number) => void
    containerClassName? : string
    orientation? : number
}

export function createRadioButtonGroup(
    { buttons
    , selected
    , className
    , onclick
    , text
    , containerClassName
    , orientation 
    } : RadioButtonOptions) {

    const box = E('span',
        { text
        , children: text && orientation !== 2 ? [E('br')] : undefined
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

export function createSVGRadioGroup(
    { buttons
    , selected
    , className
    , onclick
    , text
    , containerClassName
    , orientation 
    } : RadioButtonOptions) {
    const selectionClass = 'opaque' // 'selected'

    const box = E('span',
        { text
        , children: text && orientation !== 2 ? [E('br')] : undefined
        , className: containerClassName
        })

    const btns = buttons.map(text => {
        const svg = createSVGIcon(text as SVGIconKey)
        svg.classList.add('dim')
        return box.appendChild(svg)
    })

    if (typeof selected === 'number')
    {
        const btn = btns[selected]
        if (!btn) throw 'The index is out of bounds'
        btn.classList.add(selectionClass)
    } 
    else 
    {
        const btn = btns.find(btn => btn.dataset.svgkey === selected)
        if (!btn) throw 'The string must be the svgkey of a button.'
        btn.classList.add(selectionClass)
    }

    box.onclick = (e : MouseEvent) => {
        const btn = e.target as HTMLImageElement
        const index = btns.indexOf(btn)
        if (index >= 0)
        {
            box.dataset.selected = index.toString()
            onclick && onclick(btn.dataset.svgkey, index)

            for (const _btn of btns)
            {
                _btn.classList.toggle(selectionClass, _btn === btn)
            }
        }
    }

    return box
}
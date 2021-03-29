






export function sendConfirmationBox(msg : string, responseCallback : (res : boolean) => void) {
    const yes = E('button', 
        { className: 'push-button'
        , text: 'YES' 
        })
        
    const no = E('button', 
        { className: 'push-button'
        , text: 'NO' 
        })
        
    yes.style.margin = 
    no.style.margin = `0px 30px`

    const box = E('div', 
        { text: msg + '\n\n'
        , className: 'window show center'
        , children: [yes, no]
        })

    box.style.zIndex = 
        (++DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX).toString()
        box.style.left = 100 + 'px'
        box.style.top = 100 + 'px'
    
    document.body.appendChild(box)
    const w = box.offsetWidth
    const h = box.offsetHeight

    box.style.marginLeft = `calc(50% - ${w/2}px)`
    box.style.marginTop = `calc(10% - ${h/2}px)`
    box.style.padding = '50px'

    requestAnimationFrame(() =>
        window.addEventListener('click', onclick))

    function onclick(e : Event) {

        const answer = (response : boolean) => {
            responseCallback(response)
            window.removeEventListener('click', onclick)
            document.body.removeChild(box)
        }

        if (!box.contains(e.target as HTMLElement) || e.target === no)
        {
            answer(false)
        }
        else if (e.target === yes)
        {
            answer(true)
        }
    }
}
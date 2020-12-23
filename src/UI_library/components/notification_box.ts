






export function sendNotificationBox(msg : string) {
    const ok = E('button', 
        { className: 'top-bar-btn push-button'
        , text: 'ok' 
        })
    const box = E('div', 
        { text: msg + '\n\n'
        , className: 'window show center'
        , children: [ok]
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
        if (!box.contains(e.target as HTMLElement) || e.target === ok)
        {
            window.removeEventListener('click', onclick)
            document.body.removeChild(box)
        }
    }
}







/** For the draggable top bar to function as expected
 *  place it as the first element in an HTML element with position: absolute.
 */
function createDraggableTopBar(text? : string) {
    const bar = E('div')
    const exitBtn = E('button')

    bar.innerHTML = text || ''

    applyStyle(bar, {
        height: '30px',
        width: '100%',
        background: '#555',
        cursor: 'move',
        })

    applyStyle(exitBtn, {
        cursor: 'pointer',
        border: '0.2px solid #444',
        boxSizing: 'border-box',
        backgroundColor: 'inherit',
        height: '30px',
        width: '30px',
        float: 'right',
        color: '#a99',
        textAlign: 'center',
        lineHeight: '30px'
        })

    bar.appendChild(exitBtn)
    exitBtn.innerHTML = 'x'

    let active = false

    const mouseup = (e : MouseEvent) => {
        e.stopPropagation()
        active = false
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    const mousedown = function(e : MouseEvent) {
        e.stopPropagation()
        active = true
        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)
    }

    const mousemove = function(e : MouseEvent) {
        e.stopPropagation()

        const box = bar.parentElement
        if (!box) throw 'A box to drag is required.'

        if (active) {
            UI_clamp(
                e.clientX, 
                e.clientY + box.offsetHeight/2 - bar.offsetHeight/2,
                box, 
                document.body)
        }
    }

    const closeBox = () => {
        const box = bar.parentElement
        if (!box) throw 'A box to close is required.'

        box.style.display = 'none'
    }
    
    exitBtn.onclick = closeBox
    bar.onmousedown = mousedown
    bar.onmousemove = mousemove

    return bar
}
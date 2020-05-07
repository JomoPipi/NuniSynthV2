






/** For the draggable top bar to function as expected
 *  place it as the first element in an HTML element with 
 *  position: absolute.
 */
function createDraggableTopBar(text? : string) {
    const bar = E('div')
    const exitBtn = E('button')

    bar.innerText = text || ''

    applyStyle(bar, {
        height: '30px',
        width: '100%',
        background: '#555',
        cursor: 'move',
        paddingLeft: '5px',
        boxSizing: 'border-box'
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
    exitBtn.innerText = 'x'

    let coords : any = null

    const mouseup = (e : MouseEvent) => {
        coords = null
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    const mousedown = function({ clientX, clientY } : MouseEvent) {
        const box = bar.parentElement
        if (!box) throw 'A box to drag is required.'

        coords = [
            clientX, 
            clientY, 
            box.offsetLeft + box.offsetWidth/2, 
            box.offsetTop + box.offsetHeight/2
            ]
        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)
    }

    const mousemove = function(e : MouseEvent) {

        const box = bar.parentElement
        if (!box) throw 'A box to drag is required.'

        if (coords) {
            const [x, y, bx, by] = coords
            UI_clamp(
                e.clientX + bx - x,
                e.clientY + by - y,
                box,
                document.body)
        }
    }

    const closeBox = () => {
        const box = bar.parentElement
        if (!box) throw 'A box to close is required.'

        box.classList.remove('show')
    }
    
    exitBtn.onclick = closeBox
    bar.onmousedown = mousedown
    bar.onmousemove = mousemove

    return bar
}
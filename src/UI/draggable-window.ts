






function createDraggableWindow({ 
    text, 
    clickCallback, 
    closeCallback,
    color
} : {
    text : string, 
    clickCallback : (box : HTMLElement) => void,
    closeCallback : (box : HTMLElement) => void
    color? : string
    }) {

    const box = E('div')
    
    box.classList.add('window')
    box.classList.add('show')
    box.style.left = '50vw'
    box.style.top = '50vh'

    const bar = E('div')
    const exitBtn = E('button')

    box.appendChild(bar)
    bar.innerText = text

    applyStyle(bar, {
        height: '30px',
        width: '100%',
        background: color || '#555',
        color: rgbaColorContrast(color||'#555'),
        cursor: 'move',
        paddingLeft: '5px',
        boxSizing: 'border-box'
        })

    applyStyle(exitBtn, {
        cursor: 'pointer',
        border: '0.2px solid #444',
        boxSizing: 'border-box',
        backgroundColor: 'inherit',
        color: 'inherit',
        height: '30px',
        width: '30px',
        float: 'right',
        textAlign: 'center',
        lineHeight: '30px'
        })

    bar.appendChild(exitBtn)
    exitBtn.innerText = 'x'

    let coords = [] as number[]

    const mouseup = (e : MouseEvent) => {
        coords = []
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    const mousedown = function(e : MouseEvent) {
        if (e.target === bar) {
            coords = [
                e.clientX, 
                e.clientY,
                box.offsetLeft + box.offsetWidth/2, 
                box.offsetTop + box.offsetHeight/2
                ]
        }

        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)

        clickCallback(box)
    }

    const mousemove = function(e : MouseEvent) {

        if (coords.length) {
            const [x, y, bx, by] = coords
            UI_clamp(
                e.clientX + bx - x,
                e.clientY + by - y,
                box,
                document.body)
        }
    }

    const closeBox = () => closeCallback(box)
    
    exitBtn.onclick = closeBox
    box.onmousedown = mousedown
    bar.onmousemove = mousemove

    return box
}
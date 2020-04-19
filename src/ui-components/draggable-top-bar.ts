






/** For the draggable top bar to function as expected
 *  place it as the first element in an HTML element with position: absolute.
 */
function createDraggableTopBar() {
    const bar = E('div')
    bar.classList.add('draggable-top-bar') // or define the css here?

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
            const [x, y, W, H, w, h] = [
                e.clientX, 
                e.clientY, 
                document.body.offsetWidth, 
                document.body.offsetHeight, 
                box.offsetWidth, 
                box.offsetHeight
                ]

            box.style.left = clamp(0, x - w/2, W-w) + 'px'
            box.style.top = clamp(0, y - bar.offsetHeight/2, H-h) + 'px'
        }
    }

    bar.onmousedown = mousedown
    bar.onmousemove = mousemove

    return bar
}
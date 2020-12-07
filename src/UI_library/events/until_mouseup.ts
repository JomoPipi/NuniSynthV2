






type Handler = MouseHandler

export function doUntilMouseUp(
    mousemove : Handler, 
    { mousedown, mouseup } : Partial<Indexable<Handler>> = {}) {
    
    function _mousedown(e : MouseEvent) {
        mousedown && mousedown(e)
        window.addEventListener('mousemove', mousemove)
        window.addEventListener('mouseup', _mouseup)
    }

    function _mouseup(e : MouseEvent) {
        mouseup && mouseup(e)
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('mouseup', _mouseup)
    }

    return _mousedown
}
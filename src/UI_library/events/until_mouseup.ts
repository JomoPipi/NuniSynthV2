






type Handler = MouseHandler

export function doUntilMouseUp(
    { mousedown, mousemove, mouseup } : Partial<Record<'mouseup' | 'mousemove' | 'mousedown', Handler>> = {}) {
    
    function _mousedown(e : MouseEvent) {
        mousedown && mousedown(e)
        if (mousemove)
        {
            window.addEventListener('mousemove', mousemove)
        }
        window.addEventListener('mouseup', _mouseup)
    }

    function _mouseup(e : MouseEvent) {
        mouseup && mouseup(e)
        if (mousemove)
        {
            window.removeEventListener('mousemove', mousemove)
        }
        window.removeEventListener('mouseup', _mouseup)
    }

    return _mousedown
}
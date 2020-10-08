






type F = (e : MouseEvent) => void

export function doUntilMouseUp(mousemove : F, _mousedown? : F) {
    
    function mousedown(e : MouseEvent) {
        _mousedown && _mousedown(e)
        window.addEventListener('mousemove', mousemove)
        window.addEventListener('mouseup', mouseup)
    }

    function mouseup() {
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('mouseup', mouseup)
    }

    return mousedown
}
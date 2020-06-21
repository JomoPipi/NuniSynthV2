






function createDraggableNumberInput(
    initialValue : number, 
    mousedownFunc : () => number,
    updateFunc : (delta : number, startValue : number) => string, 
    manualUpdater : (value : number) => void ) {

    const valueInput = E('input', {
        className: 'number-grab',
        props: {
            type: 'number',
            value: initialValue
            }
        })

    let startX : number,
        startY : number, 
        startValue : number

    const mousedown = function(e : MouseEvent) {
        startX = e.clientX
        startY = e.clientY
        startValue = mousedownFunc()
        window.addEventListener('mousemove',mousemove)
        window.addEventListener('mouseup',mouseup)
    }

    const mousemove = function(e : MouseEvent) {
        e.stopPropagation()
        if (e.buttons !== 1) return;
        valueInput.value = 
            updateFunc(startY-e.clientY + (e.clientX-startX)/128.0, startValue)
    }

    const mouseup = () => {
        window.removeEventListener('mousemove',mousemove)
        window.removeEventListener('mouseup',mouseup)
    }

    valueInput.onmousedown = mousedown
    valueInput.oninput = () => manualUpdater(+valueInput.value)
    return valueInput
}
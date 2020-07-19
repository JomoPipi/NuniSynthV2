export function createDraggableNumberInput(initialValue, mousedownFunc, updateFunc, manualUpdater) {
    const valueInput = E('input', {
        className: 'number-grab',
        props: {
            type: 'number',
            value: initialValue
        }
    });
    let startX, startY, startValue;
    const mousedown = function (e) {
        startX = e.clientX;
        startY = e.clientY;
        startValue = mousedownFunc();
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    };
    const mousemove = function (e) {
        e.stopPropagation();
        if (e.buttons !== 1)
            return;
        valueInput.value =
            updateFunc(startY - e.clientY + (e.clientX - startX) / 128.0, startValue);
    };
    const mouseup = () => {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
    };
    valueInput.onmousedown = mousedown;
    valueInput.oninput = () => manualUpdater(+valueInput.value);
    return valueInput;
}
//# sourceMappingURL=number_input.js.map
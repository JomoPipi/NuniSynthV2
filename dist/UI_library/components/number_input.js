export function createDraggableNumberInput(initialValue, mousedownFunc, updateFunc, settings) {
    const valueInput = E('input', { className: 'number-grab',
        props: { type: 'number',
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
    const update = realUpdateFunc(updateFunc, settings);
    const mousemove = function (e) {
        e.stopPropagation();
        if (e.buttons !== 1)
            return;
        valueInput.value =
            update(startY - e.clientY + (e.clientX - startX) / 128.0, startValue);
    };
    const mouseup = () => {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
    };
    valueInput.onmousedown = mousedown;
    valueInput.oninput = () => updateFunc(+valueInput.value);
    return valueInput;
}
function realUpdateFunc(fn, settings) {
    return (delta, value) => {
        const { amount, min, max, isLinear } = settings;
        const useLinear = isLinear || value === 0;
        const factor = useLinear ? delta : delta * value;
        const newValue = clamp(min, value + factor * amount, max);
        fn(newValue);
        return newValue.toPrecision(7);
    };
}
//# sourceMappingURL=number_input.js.map
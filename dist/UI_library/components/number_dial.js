"use strict";
function createNumberDialComponent(initialValue, manualUpdater, props) {
    const box = E('span', {
        className: 'number-dial-component'
    });
    const dial = Object.assign(new JsDial(), props.dial);
    const valueInput = E('input', {
        className: 'number-dial-input',
        props: {
            type: 'number',
            value: initialValue,
            oninput: () => {
                manualUpdater(+valueInput.value);
                dial.update(+valueInput.value);
            }
        }
    });
    Object.assign(valueInput, props.input);
    dial.attach((value) => {
        valueInput.value = value.toString();
        manualUpdater(value);
    });
    box.append(valueInput, dial.html);
    return Object.assign(box, {
        setValue(value) {
            valueInput.value = value.toString();
            dial.update(value);
        }
    });
}
//# sourceMappingURL=number_dial.js.map
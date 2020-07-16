"use strict";
function createToggleButton(obj, prop, options) {
    const { text, update, className } = options;
    const btn = E('button', {
        text: text || prop,
        className
    });
    btn.classList.toggle('selected', obj[prop]);
    btn.onclick = () => {
        obj[prop] ^= 1;
        const on = obj[prop] ? true : false;
        btn.classList.toggle('selected', on);
        update && update(on);
    };
    return btn;
}
//# sourceMappingURL=toggle_button.js.map
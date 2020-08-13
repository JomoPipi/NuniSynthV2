"use strict";
const log = console.log;
const trace = (x) => (log(x), x);
const D = (id) => {
    const el = document.getElementById(id);
    if (!el)
        throw `Error: No element found with id ${id}.`;
    return el;
};
const E = (x, settings = {}) => {
    const element = document.createElement(x);
    const { text, className, children, props } = settings;
    if (text)
        element.innerText = text;
    if (className) {
        for (const name of className.split(' ')) {
            element.classList.add(name);
        }
    }
    if (children) {
        element.append(...children);
    }
    Object.assign(element, props);
    return element;
};
const distance = (x, y, x2, y2) => ((x - x2) ** 2 + (y - y2) ** 2) ** 0.5;
const clamp = (min, value, max) => Math.max(Math.min(max, value), min);
const PHI = (Math.sqrt(5) + 1) / 2.0;
const TR2 = 2 ** (1.0 / 12.0);
const TAU = 2 * Math.PI;
const twoThirdsPi = TAU / 3.0;
const dBToVolume = (dB) => 10 ** (0.05 * dB);
const volumeTodB = (volume) => 20 * Math.log10(volume);
const ISMAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const DIRTYGLOBALS = {};
//# sourceMappingURL=helpers.js.map
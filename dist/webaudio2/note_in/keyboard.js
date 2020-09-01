const keyCodes = [].concat(...[
    '1234567890',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm'
].map((s, i) => [...s.toUpperCase()].map(c => c.charCodeAt(0))
    .concat([
    [189, 187],
    [219, 221],
    [186, 222],
    [188, 190, 191]
][i])));
const keymap = keyCodes.reduce((map, key, i) => {
    map[key] = i;
    return map;
}, {});
const held = [];
const scale = keyCodes.map((_, i) => i * 100);
export const KB = { keyCodes,
    keymap,
    held,
    scale, mode: 'poly', nVoices: 10,
    attachToGraph, connectedNodes: function* () { yield* []; }
};
function attachToGraph(getNodes) {
    KB.connectedNodes = getNodes;
    document.onkeydown = updateKeys(true);
    document.onkeyup = updateKeys(false);
}
function updateKeys(keydown) {
    return ({ keyCode: key }) => {
        if (key in keymap) {
            updateKBImage(key, keydown);
            const idx = held.indexOf(key);
            if (keydown) {
                if (idx >= 0)
                    return;
                held.push(key);
            }
            else {
                held.splice(idx, 1);
                if (idx !== held.length && KB.mode === 'mono') {
                    return;
                }
            }
            for (const an of KB.connectedNodes()) {
                an.update(keydown, key);
            }
        }
        else {
            log('keyCode =', key);
        }
    };
}
const slider = D('n-poly-slider');
slider.oninput = function () {
    D('n-poly-text').innerText = slider.value;
    KB.nVoices = +slider.value;
};
function updateKBImage(code, keydown) {
    const selector = [
        '[data-key="' + code + '"]',
        '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]'
    ].join(',');
    document.querySelector(selector)
        .classList
        .toggle('key-pressed', keydown);
}
//# sourceMappingURL=keyboard.js.map
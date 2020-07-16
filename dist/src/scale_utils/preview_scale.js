import { KB, NuniSourceNode } from '../webaudio2/internal.js';
export function refreshKeys() {
    for (const an of KB.connectedNodes()) {
        an.refresh();
    }
}
export function previewScale() {
    const mode = KB.mode;
    let count = 0;
    for (const key of KB.keyCodes) {
        const cents = KB.scale[KB.keymap[key]];
        if (cents > 2400)
            return;
        const speed = 0.1;
        for (const an of KB.connectedNodes()) {
            if (an instanceof NuniSourceNode && an.kbMode) {
                an.playKeyAtTime(key, an.ctx.currentTime + count * speed, speed / 2.0);
            }
        }
        count++;
    }
}
//# sourceMappingURL=preview_scale.js.map
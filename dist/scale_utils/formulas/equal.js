import { KB } from '../../webaudio2/internal.js';
import { refreshKeys, previewScale } from '../preview_scale.js';
export const setEqualTemperamentScale = (_ => {
    const [intervals, cents] = [
        D('intervals-per-octave'), D('cents-per-step')
    ];
    const assignToKeyboard = (centDelta) => {
        KB.scale = KB.keyCodes.map((_, i) => i * centDelta);
        refreshKeys();
    };
    intervals.oninput = function (e) {
        const value = intervals.value || 1e-9;
        const c = 1200.0 / +value;
        cents.value = c.toString();
    };
    cents.oninput = function (e) {
        const c = +cents.value || 1e-9;
        intervals.value = (1200.0 / c).toString();
    };
    return function (edo) {
        setTimeout(() => {
            const value = edo ? 1200.0 / edo : +cents.value;
            assignToKeyboard(value);
            previewScale();
        }, 100);
    };
})();
//# sourceMappingURL=equal.js.map
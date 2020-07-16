import { KB } from '../../webaudio2/internal.js';
import { refreshKeys, previewScale } from '../preview_scale.js';
export const setDeltaExpressionScale = (_ => {
    const deltaExp = D('delta-expression');
    return function () {
        const [newScale, isError] = validateExp(deltaExp.value);
        if (isError) {
            deltaExp.value = isError;
            return;
        }
        KB.scale = newScale;
        setTimeout(() => {
            refreshKeys();
            previewScale();
        }, 100);
    };
    function validateExp(exp) {
        let newScale;
        try {
            newScale =
                KB.keyCodes.reduce(function (a, _, n) {
                    return a.concat(a[a.length - 1] + eval(exp));
                }, [0]);
        }
        catch (e) {
            return [[], e];
        }
        if (newScale.some(x => isNaN(x) || typeof x !== 'number')) {
            return [[], 'Invalid Expression'];
        }
        return [newScale];
    }
})();
//# sourceMappingURL=deltas.js.map
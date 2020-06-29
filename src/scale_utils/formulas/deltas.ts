






import { KB } from '../../webaudio2/note_in/keyboard.js'
import { refreshKeys, previewScale } from '../preview_scale.js'

export const setDeltaExpressionScale = (_ => {
    const deltaExp = D('delta-expression') as HTMLInputElement
    return function() {
        const [newScale, isError] = validateExp(deltaExp.value)

        if (isError) {
            deltaExp.value = isError
            return;
        }

        KB.scale = newScale

        setTimeout(() => {// *
            refreshKeys()

            previewScale()
        }, 100)
    }

    function validateExp(exp : string) {
        let newScale

        try {
            newScale = 
            KB.keyCodes.reduce(function(a,_,n) { 
            /**
             * The 3rd param must be named `n` 
             * to be compatible with the expression.
             */
                return a.concat(a[a.length-1] + eval(exp))
            }, [0])
                    
        } catch (e) {
            return [[], e]
        }
        if (newScale.some(x => isNaN(x) || typeof x !== 'number')) {
            return [[], 'Invalid Expression']
        }
        
        return [newScale]
    }
})()
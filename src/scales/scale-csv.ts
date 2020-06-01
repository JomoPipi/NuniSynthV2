






import { KB } from '../webaudio2/note_in/keyboard.js'
import { refreshKeys, previewScale } from './scales.js'

export const setScaleFromCSV = (_ => {
    const valueInput = D('scale-csv-input') as HTMLInputElement

    function assignToKeyboard(arr : number[]) {
        const N = arr.length

        KB.scale = 
        KB.keyCodes.map((_,i) => 
            arr[i % N] + 1200 * (i / N | 0)
            )

        refreshKeys()
    }

    function toCents(s : string) {
        const [a,b] = s.split('/')
        if (!b) return +a || 0

        return 1200 * Math.log2(+a/+b) || 0
    }

    return function(input? : string) {
        const values = (input ?? valueInput.value)
            .split(',')
            .map(s => s.trim())
            .sort((a,b) => toCents(a) - toCents(b))

        if (!input) {
            valueInput.value = values.join(',  ')
        }

        setTimeout(() => {// *
            assignToKeyboard([0].concat(values.map(toCents)))

            previewScale()
            }, 100)
    }
})()
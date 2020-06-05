






import KB from '../webaudio2/note_in/keyboard.js'
import { refreshKeys, previewScale } from './scales.js'

export const setEqualTemperamentScale = (_ => {
    const [intervals, cents] = [
        D('intervals-per-octave'), D('cents-per-step')
        ] as HTMLSelectElement[]

    const assignToKeyboard = (centDelta : number) => {
        KB.scale = KB.keyCodes.map((_,i) => 
            i * centDelta)
        
        refreshKeys()
    }

    intervals.oninput = function(e : Event) {
        const value = intervals.value || 1e-9

        const c = 1200.0 / +value
        cents.value = c.toString()
    } 

    cents.oninput = function(e : Event) {
        const c = +cents.value || 1e-9

        intervals.value = (1200.0 / c).toString()
    } 

    return function(edo? : number) {
        setTimeout(() => {// *
            const value = edo ? 1200.0 / edo : +cents.value

            assignToKeyboard(value)
            previewScale()
        }, 100)
    }

    // * - these setTimeouts are needed to stop the Keyboard from playing by itself.
    // When entering values, for some reason, keyup doesn't register.
})()
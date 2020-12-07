






import { createDiscreteDialComponent } from './discrete_dial.js'
import { createNumberDialComponent3 } from './number_input.js'







type AdditionalArgs = {
    fn : (value : number | string) => void
    mapStringToNumber : (s : string) => number
    discreteDial?: { 
        discreteModeTickFactor : number
    }
    continuousDial: {
        min : number
        max : number
        sensitivity? : number
        rounds? : number
    }
    mousedown? : (e : MouseEvent) => void
    mouseup? : (e : MouseEvent) => void
}

export function createVersatileNumberDialComponent(
    initialValue : string | number, 
    optionList : string[], 
    options : AdditionalArgs) {
/** VersatileNumberComponent:
 *  2 modes: continuous & discrete
 *  doubleclick the dial to switch between the two modes
 * 
 *  Continuous Mode: 
 *      - dial moves smoothly from min to max
 *      - has corresponding number input
 * 
 *  Discrete Mode: 
 *      - dial 'ticks' through options and wraps at the end
 *      - has corresponding read-only text 
 *
 * **/
    const { min, max } = options.continuousDial
    const numvalue = typeof initialValue === 'number' ? initialValue : options.mapStringToNumber(initialValue)
    const strindex = typeof initialValue === 'string' ? optionList.indexOf(initialValue) : 0
    const continunousModeComponent = createNumberDialComponent3(numvalue, options.fn, { min, max, amount: 2**-8, isLinear: false, mouseup: options.mouseup }, 1)

    const discreteModeComponent = createDiscreteDialComponent(strindex, optionList, options.fn, { mouseup: options.mouseup })

    ;(typeof initialValue === 'number' ? discreteModeComponent : continunousModeComponent).container.classList.toggle('hide')
    
    const toggle = E('input', { className: 'toggle0' }); toggle.type = 'checkbox'
    const children = [continunousModeComponent.container, discreteModeComponent.container, toggle]
    const box = E('div', { children })

    toggle.oninput = () => {
        discreteModeComponent.container.classList.toggle('hide', !toggle.checked)
        continunousModeComponent.container.classList.toggle('hide', toggle.checked)
    }

    return box
}







import { createDiscreteDialComponent } from './discrete_dial.js'
import { createNumberDialComponent3 } from './number_input.js'







type AdditionalArgs = {
    fn : (value : number | string) => void
    mapStringToNumber : Record<string, number>
    mapNumberToString : (n : number) => string
    discreteDial?: { 
        discreteModeTickFactor : number
    }
    continuousDial: {
        min : number
        max : number
        sensitivity? : number
        rounds? : number
    }
    mousedown? : MouseHandler
    mouseup? : MouseHandler
    forceMode? : 'discrete' | 'continuous'
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
    const numvalue = typeof initialValue === 'number' ? initialValue : options.mapStringToNumber[initialValue]
    const strindex = optionList.indexOf(typeof initialValue === 'string' ? initialValue : options.mapNumberToString(initialValue))
    const continunousModeComponent = createNumberDialComponent3(numvalue, options.fn, 
        { min, max, amount: 2**-8, isLinear: false, mouseup: options.mouseup }, 1)

    const discreteModeComponent = createDiscreteDialComponent(strindex, optionList, options.fn, { mouseup: options.mouseup })

    const toggle = E('input', { className: 'toggle0' }); toggle.type = 'checkbox'
    const children = [continunousModeComponent.container, discreteModeComponent.container, toggle]
    const box = E('div', { children })

    if (typeof initialValue === 'number') setContinuousMode(true)
    
    if (options.forceMode === 'continuous' && typeof initialValue === 'string')
    {
        setContinuousMode(true)
    }
    else if (options.forceMode === 'discrete' && typeof initialValue === 'number')
    {
        setContinuousMode(false)
    }

    toggle.oninput = () => {
        setContinuousMode(toggle.checked)
    }

    function setContinuousMode(itsTrue : boolean) {
        if (itsTrue) 
        {
            const value = options.mapStringToNumber[optionList[discreteModeComponent.getIndex()]]
            continunousModeComponent.setValue(value)
        }
        else
        {
            const index = optionList.indexOf(options.mapNumberToString(continunousModeComponent.getValue()))
            discreteModeComponent.setIndex(index)

            // Do this because we want to sync the sequencers:
            options.mouseup && options.mouseup(0 as any)
        }
        discreteModeComponent.container.classList.toggle('hide', toggle.checked = itsTrue)
        continunousModeComponent.container.classList.toggle('hide', !itsTrue)
    }

    return box
}
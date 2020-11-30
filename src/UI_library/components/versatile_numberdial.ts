






type AdditionalArgs = {
    fn? : (value : number | string) => void
    discreteDial?: { 
        discreteModeTickFactor : number
    }
    continuousDial: {
        min : number
        max : number
        sensitivity? : number
        rounds? : number
    }
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

    return E('div')
}
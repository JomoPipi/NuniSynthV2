






{
    const [intervals, cents] = [
        D('intervals-per-octave'), D('cents-per-step')
        ] as HTMLSelectElement[]

    const assignToKeyboard = (centDelta : number) => {
        Keyboard.scale = Keyboard.keys.map((_,i) => 
            i * centDelta)
        
        refreshKeys()
    }

    intervals.oninput = function(e : any) {
        const { value } = intervals
        const c = 1200.0 / +value
        cents.value = c.toString()
        log('cents =',c)
        assignToKeyboard(c)
    } 

    cents.oninput = function(e : any) {
        const c = +cents.value

        intervals.value = (1200.0 / c).toString()
        log('cents =',c)
        assignToKeyboard(c)
    } 
}
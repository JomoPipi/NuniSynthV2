






function refreshKeys() {
    for (const an of KB.connectedNodes()) {
        an.refresh()
    }
}

function previewScale() {
    const mode = KB.mode // *
    let count = 0
    for (const key of KB.keyCodes) {
        const cents = KB.scale[KB.keymap[key]]
        if (cents > 2400) return;

        const [on,off] = [true,false].map(bool => 
            () => {
                if (mode === KB.mode) { // *
                    for (const an of KB.connectedNodes()) {
                        an.update(bool, key)
                    }
                }
            })

        // ( ͡° ͜ʖ ͡°)
        const speed = 69
        
        setTimeout(on, ++count * speed)

        setTimeout(off, count * speed + speed / 2.0)
    }
    // * prevents bug that may happen when user switches 
    // modes while the scale is being previewed.
}

{
    const [deltaBtnId, equalBtnId, csvBtnId] = 
        'apply-cent-delta,apply-equal-temperament,apply-scale-csv'
        .split(',')

    D('scale-builder')!.onclick = function(e : MouseEvent) {
        const btnId = (e.target as HTMLElement).id
        
        ;((<Indexed>{
            [deltaBtnId]: setDeltaExpressionScale,
            [equalBtnId]: setEqualTemperamentScale,
            [csvBtnId]:   setScaleFromCSV
        })[btnId] || id)()

        if (btnId === deltaBtnId) {
            setDeltaExpressionScale()

        } else if (btnId === equalBtnId) {
            setEqualTemperamentScale()

        } else if (btnId === csvBtnId) {
            setScaleFromCSV()
        }
    }
}
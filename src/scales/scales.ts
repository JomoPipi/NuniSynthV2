






function refreshKeys() {
    for (const an of KB.connectedNodes()) {
        an.refresh()
    }
}

function previewScale() {
    let count = 0
    for (const key of KB.keyCodes) {
        const cents = KB.scale[KB.keymap[key]]
        if (cents > 2400) return;

        // ( ͡° ͜ʖ ͡°)
        const speed = 69

        setTimeout(() => {

            for (const an of KB.connectedNodes()) {
                an.update(true, key)
            }
            
        }, ++count * speed)

        setTimeout(() => {

            for (const an of KB.connectedNodes()) {
                an.update(false, key)
            }

        }, count * speed + speed / 2.0)

    }
}

{
    const [deltaBtnId, equalBtnId, csvBtnId] = 
        'apply-cent-delta,apply-equal-temperament,apply-scale-csv'
        .split(',')

    D('scale-builder')!.onclick = function(e : MouseEvent) {
        const btnId = (e.target as HTMLElement).id
        
        ;(<Indexed>{
            [deltaBtnId]: setDeltaExpressionScale,
            [equalBtnId]: setEqualTemperamentScale,
            [csvBtnId]:   setScaleFromCSV
        })[btnId]()

        // if (btnId === deltaBtnId) {
        //     setDeltaExpressionScale()

        // } else if (btnId === equalBtnId) {
        //     setEqualTemperamentScale()

        // } else if (btnId === csvBtnId) {
        //     setScaleFromCSV()
        // }
    }
}
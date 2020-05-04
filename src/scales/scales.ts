






function refreshKeys() {
    for (const { audioNode: an } of G.nodes) {
        if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
            an.refresh()
        }
    }
}

function previewScale() {
    let count = 0
    for (const key of KB.keys) {
        const cents = KB.scale[KB.keymap[key]]
        if (cents > 2400) break;

        // ( ͡° ͜ʖ ͡°)
        const speed = 69
        setTimeout(() => {

            for (const { audioNode:an } of G.nodes) {
                if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                    an.update(true, key)
                }
            }
            
            setTimeout(() => {
                for (const { audioNode:an } of G.nodes) {
                    if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                        an.update(false, key)
                    }
                }
            }, speed / PHI)

        }, count++ * speed)
    }
}

{
    const [deltaBtnId, equalBtnId, csvBtnId] = 
        'apply-cent-delta,apply-equal-temperament,apply-scale-csv'
        .split(',')

    D('scale-builder')!.onclick = function(e : MouseEvent) {
        const btnId = (e.target as HTMLElement).id
        
        if (btnId === deltaBtnId) {
            setDeltaExpressionScale()

        } else if (btnId === equalBtnId) {
            setEqualTemperamentScale()

        } else if (btnId === csvBtnId) {
            setScaleFromCSV()
        }
    }
}
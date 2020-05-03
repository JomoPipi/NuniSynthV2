






function refreshKeys() {
    for (const { audioNode: an } of G.nodes) {
        if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
            an.refresh()
        }
    }
}

function previewScale() {
    
}

{
    const [deltaBtnId, equalBtnId, csvBtnId] = 
        'apply-cent-delta,apply-equal-temperament,apply-scale-csv'
        .split(',')

    D('scale-builder')!.onclick = function(e : MouseEvent) {
        const btnId = (e.target as HTMLElement).id
        log('btnId =',btnId)
        
        if (btnId === deltaBtnId) {
            setDeltaExpressionScale()

        } else if (btnId === equalBtnId) {
            setEqualTemperamentScale()

        } else if (btnId === csvBtnId) {
            setScaleFromCSV()
        }
    }
}
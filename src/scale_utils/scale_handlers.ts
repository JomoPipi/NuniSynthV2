






import { setScaleFromCSV } from './formulas/csv_list.js'
import { setEqualTemperamentScale } from './formulas/equal.js'
import { setDeltaExpressionScale } from './formulas/deltas.js'

{
    const [deltaBtnId, equalBtnId, csvBtnId] = 
        'apply-cent-delta,apply-equal-temperament,apply-scale-csv'
        .split(',')

    D('scale-builder')!.onclick = function(e : MouseEvent) {
        const btnId = (e.target as HTMLElement).id
        
        // ;((<Indexed>{
        //     [deltaBtnId]: setDeltaExpressionScale,
        //     [equalBtnId]: setEqualTemperamentScale,
        //     [csvBtnId]:   setScaleFromCSV
        // })[btnId] || id)()

        if (btnId === deltaBtnId) {
            setDeltaExpressionScale()

        } else if (btnId === equalBtnId) {
            setEqualTemperamentScale()

        } else if (btnId === csvBtnId) {
            setScaleFromCSV()
        }
    }
}
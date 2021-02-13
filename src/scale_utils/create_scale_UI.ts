






import { setScaleFromCSV } from './formulas/csv_list.js'
import { setEqualTemperamentScale } from './formulas/equal.js'
import { setDeltaExpressionScale } from './formulas/deltas.js'
import { scalePresets } from './presets.js'

apply_scale_button: {
    const [deltaBtnId, equalBtnId, csvBtnId] =
        'apply-cent-delta,apply-equal-temperament,apply-scale-csv'
        .split(',')

    D('scale-builder').onclick = function(e : MouseEvent) {
        const btnId = (e.target as HTMLElement).id
        
        if (btnId === deltaBtnId) 
        {
            setDeltaExpressionScale()
        } 
        else if (btnId === equalBtnId) 
        {
            setEqualTemperamentScale()
        } 
        else if (btnId === csvBtnId) 
        {
            setScaleFromCSV()
        }
    }
}

apply_scale_preset: {
    const div = D('scale-preset-list')
    
    for (const name in scalePresets) 
    {
        const item = E('button', 
            { text: name
            , className: 'list-btn push-button'
            })
        div.appendChild(item)
    }

    div.onclick = function(e : MouseEvent) {
        const name = (e.target as HTMLElement).innerText
        const P = scalePresets as Indexed
        if (name in P) 
        {
            if (name.endsWith('EDO')) 
            {
                setEqualTemperamentScale(P[name])
            }
            else 
            {
                setScaleFromCSV(P[name])
            }
        }
    }
}
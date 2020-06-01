






import { KB } from '../webaudio2/note_in/keyboard.js'
import { setScaleFromCSV } from './scale-csv.js'
import { setEqualTemperamentScale } from './equal.js'
import { setDeltaExpressionScale } from './deltas.js'
import { NuniSourceNode } from '../webaudio2/note_in/nuni_source_node.js'
import { OscillatorNode2 } from '../webaudio2/note_in/oscillator2.js'
import { audioCtx } from '../webaudio2/webaudio2.js'

export function refreshKeys() {
    for (const an of KB.connectedNodes()) {
        an.refresh()
    }
}

export function previewScale() {
    const mode = KB.mode // *
    let count = 0
    for (const key of KB.keyCodes) {
        const cents = KB.scale[KB.keymap[key]]
        if (cents > 2400) return;

        const speed = 0.1
        for (const an of KB.connectedNodes()) {
            if (an instanceof NuniSourceNode) {
                an.playKeyAtTime(key, an.ctx.currentTime + count * speed, speed/2.0)
            }
        }
        count++

        // const [on,off] = [true,false].map(bool => 
        //     () => {
        //         if (mode === KB.mode) { // *
        //             for (const an of KB.connectedNodes()) {
        //                 an.update(bool, key)
        //             }
        //         }
        //     })

        // const speed = 100

        // setTimeout(on, ++count * speed)
        // setTimeout(off, count * speed + speed / 4.0)
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
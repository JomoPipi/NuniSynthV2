






import { createADSREditor } from "../../adsr/adsr_editor.js"


export function createKBMacroWindow(callback : (adsr : ADSRData, expression : string) => void) {

    const expEditor = E('input', { className: 'text-input-medium center' })
        expEditor.type = 'text'
        expEditor.value = '100 * n' 

    const adsr = { attack: 0.01, decay:0,sustain:1,release:0,curve:'S' as CurveType }
    const attackKnob = createADSREditor(adsr)
        attackKnob.style.margin = '0px 20px'

    const go = E('button', { className: 'nice-btn2', text: 'GO' })
        go.onclick = () => callback(adsr, expEditor.value)

    return E('div', 
    { className: 'node-window'
    , text: 'KEYBOARD MACRO'
    , children: [E('div', { className: 'vert-grid center', children: [expEditor] }) , attackKnob, go]
    })
}
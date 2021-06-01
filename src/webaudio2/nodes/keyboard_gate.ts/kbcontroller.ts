






import { createNumberDialComponent3, createRadioButtonGroup, JsDial } from "../../../UI_library/internal.js"
import { createADSREditor } from "../../adsr/adsr_editor.js"
import { KEYSTRING } from "../../constants.js"
import { KB } from "../../internal.js"




interface IKBGate {
    keyData : KeyDataMap
    // updateKeydata : (key : LowerCaseKeyboardKey, value : any) => void
    toggleKeyEnabled : (key : LowerCaseKeyboardKey, enable : boolean) => void
    triggerMode : TriggerModes
}
type LowerCaseKeyboardKey = string
enum TriggerModes { play='play', toggle='toggle' }
enum EnvelopeTypes { NONE, ATTACK_ONLY, AD, ADSR }
type Envelope = { attack : number, decay : number, sustain : number, release : number, curve : CurveType }
type KeyData = ({
    envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.AD | EnvelopeTypes.ADSR
} | {
    envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.ATTACK_ONLY
    active: false
}) & {
    gain : number // Defaults to 1, can be used for pitch
    adsr : Envelope
}
type KeyDataMap = Record<LowerCaseKeyboardKey, KeyData>




export class KeyboardController {

    container : HTMLElement

    private kbGate : IKBGate
    private keyControls : HTMLElement
    private kbImage : HTMLElement
    private getKey : Indexable<HTMLElement>
    private selectedKey = -1

    constructor(kbGate : IKBGate) {
        this.kbGate = kbGate
        
        const modeSelect = createRadioButtonGroup(
            { buttons: ['play', 'toggle'] as const
            , selected: 0
            , className: 'nice-btn2'
            , text: 'mode'
            , onclick: 
                (d, index) => {
                    this.kbGate.triggerMode = d === 'play'
                        ? TriggerModes.play
                        : TriggerModes.toggle
                    this.updateView()
                }
            })

        this.keyControls = E('div')
        this.kbImage = E('div')
        this.container = E('div', 
            { children: [ modeSelect, this.kbImage, this.keyControls]
            , className: 'vert-grid some-margin'
            })

        this.getKey = {}

        this.kbImage.onclick = e => {
            const el = e.target as HTMLElement
            const p = el.parentElement!
            const get = (x : HTMLElement) => x.getAttribute('key-char')
            const idx = get(el) || get(p)
            if (idx)
            {
                this.selectKey(+idx)
            }
        }
        
        this.updateView()
    }

    updateView() {
        this.kbImage.innerHTML = ''
        const sortedKeys = Object.keys(this.kbGate.keyData).sort((a,b) =>
            KEYSTRING.indexOf(a) - KEYSTRING.indexOf(b))
        for (const key of sortedKeys)
        {
            const n = KEYSTRING.indexOf(key)
            const elem = this.getKey[key] = 
                E('span', { className: 'keyboard-key', text: key })
                elem.setAttribute('key-char', n.toString())
            if (this.selectedKey === n) elem.classList.add('active')
            this.kbImage.appendChild(elem)
        }

        
        const addKey = E('span', { className: 'keyboard-key', text: 'add key' })
        addKey.onclick = () => {
            const superkeydown = document.onkeydown
            addKey.innerText = '...'
            document.onkeydown = ({ code }) => {
                if (code in KB.KEY_NUMBER)
                {
                    const n = KB.KEY_NUMBER[code as 'Digit1']
                    this.kbGate.toggleKeyEnabled(KEYSTRING[n], true)
                    this.selectKey(n)
                }
                document.onkeydown = superkeydown
                this.updateView()
            }

        }
        this.kbImage.appendChild(addKey)
        
        this.showKeyControls(KEYSTRING[this.selectedKey])
    }

    private showKeyControls(char : LowerCaseKeyboardKey) {
        this.keyControls.innerHTML = ''
        if (!char) return;

        const deleteBtn = E('span', { className: 'nice-btn', text: '🗑️' })
        // deleteBtn.style.width = '100%'
        // deleteBtn.style.textAlign = 'right'
        deleteBtn.style.float = 'right'
        deleteBtn.style.background = 'transparent'
        deleteBtn.onclick = () => {
            // if (KEYSTRING[this.selectedKey] === char)
            // {
            //     this.selectedKey = KEYSTRING.indexOf(Object.keys(this.kbGate.keyData)[0])
            // }
            this.kbGate.toggleKeyEnabled(char, false)
            if (KEYSTRING[this.selectedKey] === char) this.selectedKey = -1
            this.updateView()
        }
        deleteBtn.style.float = 'right'
        
        const adsr = createADSREditor(this.kbGate.keyData[char].adsr,
            { attackOnly: this.kbGate.triggerMode === TriggerModes.toggle })

            //! check what this does before removing: 
            adsr.style.border = '1px solid transparent'
            adsr.classList.add('flex-center')
            adsr.style.flexDirection = 'vertical'
            
        this.keyControls.append(
            E('div', { className: 'center', text: 'Key: ' + char }), 
            createNumberDialComponent3(
                this.kbGate.keyData[char].gain,
                n => this.kbGate.keyData[char].gain = n, 
                { amount: 0.001
                , min: 0
                , max: 1
                , isLinear: false
                , rounds: 2
                }).container,
            deleteBtn, 
            adsr)
    }

    private selectKey(index : number) {
        this.selectedKey = index
        this.updateView()
    }
}
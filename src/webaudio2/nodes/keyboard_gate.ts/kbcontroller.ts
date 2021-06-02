






import { sendNotificationBox } from "../../../UI_library/components/notification_box.js"
import { createNumberDialComponent3, createRadioButtonGroup, JsDial } from "../../../UI_library/internal.js"
import { createADSREditor } from "../../adsr/adsr_editor.js"
import { KEYSTRING } from "../../constants.js"
import { KB } from "../../internal.js"
import { createKBMacroWindow } from "./kbmacrowindow.js"




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

const kbHTMLString = `<div class="keyboard"> <!-- The image that shows the user what keys are being pressed. --> <div class="keyboard__row"> <div class="key--double" data-not-in-use="1"></div> <div class="key--double" key-char="0"> <div>!</div> <div>1</div> </div> <div class="key--double" key-char="1"> <div>@</div> <div>2</div> </div> <div class="key--double" key-char="2"> <div>#</div> <div>3</div> </div> <div class="key--double" key-char="3"> <div>$</div> <div>4</div> </div> <div class="key--double" key-char="4"> <div>%</div> <div>5</div> </div> <div class="key--double" key-char="5"> <div>^</div> <div>6</div> </div> <div class="key--double" key-char="6"> <div>&amp;</div> <div>7</div> </div> <div class="key--double" key-char="7"> <div>*</div> <div>8</div> </div> <div class="key--double" key-char="8"> <div>(</div> <div>9</div> </div> <div class="key--double" key-char="9"> <div>)</div> <div>0</div> </div> <div class="key--double" key-char="10"> <div>_</div> <div>-</div> </div> <div class="key--double" key-char="11"> <div>+</div> <div>=</div> </div> <div class="key--bottom-right key--word key--w4" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-not-in-use="1"></div> <div class="key--letter" key-char="12">Q</div> <div class="key--letter" key-char="13">W</div> <div class="key--letter" key-char="14">E</div> <div class="key--letter" key-char="15">R</div> <div class="key--letter" key-char="16">T</div> <div class="key--letter" key-char="17">Y</div> <div class="key--letter" key-char="18">U</div> <div class="key--letter" key-char="19">I</div> <div class="key--letter" key-char="20">O</div> <div class="key--letter" key-char="21">P</div> <div class="key--double" key-char="22"> <div>{</div> <div>[</div> </div> <div class="key--double" key-char="23"> <div>}</div> <div>]</div> </div> <div class="key--double" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-not-in-use="1"></div> <div class="key--letter" key-char="24">A</div> <div class="key--letter" key-char="25">S</div> <div class="key--letter" key-char="26">D</div> <div class="key--letter" key-char="27">F</div> <div class="key--letter" key-char="28">G</div> <div class="key--letter" key-char="29">H</div> <div class="key--letter" key-char="30">J</div> <div class="key--letter" key-char="31">K</div> <div class="key--letter" key-char="32">L</div> <div class="key--double" key-char="33"> <div>:</div> <div>;</div> </div> <div class="key--double" key-char="34"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-not-in-use="1"></div> <div class="key--letter" key-char="35">Z</div> <div class="key--letter" key-char="36">X</div> <div class="key--letter" key-char="37">C</div> <div class="key--letter" key-char="38">V</div> <div class="key--letter" key-char="39">B</div> <div class="key--letter" key-char="40">N</div> <div class="key--letter" key-char="41">M</div> <div class="key--double" key-char="42"> <div>&lt;</div> <div>,</div> </div> <div class="key--double" key-char="43"> <div>&gt;</div> <div>.</div> </div> <div class="key--double" key-char="44"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-not-in-use="1"></div> </div></div>`

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

        const kbMacroWindow = createKBMacroWindow((adsr, exp) => {
            for (let n = 0; n < KEYSTRING.length; n++)
            {
                const c = KEYSTRING[n]
                this.kbGate.toggleKeyEnabled(c, true)
                const kd = this.kbGate.keyData[c]
                Object.assign(kd.adsr, adsr)
                kd.gain = eval(exp)
            }
            kbMacroWindow.classList.remove('show')
            this.updateView()
        })
        const kbMacro = E('span',
            { text: '🎹'
            , className: 'kb-button nice-btn2'
            , children: [kbMacroWindow]
            })
            kbMacroWindow.style.position = 'absolute'
            kbMacroWindow.style.left = '105%'
            kbMacro.style.position = 'relative'
            kbMacro.onclick = e => kbMacroWindow.contains(e.target as HTMLElement)
                ? 0
                : kbMacroWindow.classList.toggle('show')

        this.keyControls = E('div')
        this.kbImage = E('div')
        this.container = E('div', 
            { children: [E('div', { className: 'flex-center space-between', children: [modeSelect, kbMacro] }), this.kbImage, this.keyControls]
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
        const enabledKeys = Object.keys(this.kbGate.keyData)
        const everyKeyIsEnabled = enabledKeys.length === KEYSTRING.length
        if (everyKeyIsEnabled)
        {
            this.kbImage.innerHTML = kbHTMLString
            const selected = this.selectedKey.toString() 
            for (const elem of this.kbImage.querySelectorAll('[key-char]'))
            {
                if (selected === elem.getAttribute('key-char'))
                {
                    elem.classList.add('active')
                }
            }
        }
        else
        {
            const sortedKeys = enabledKeys.sort((a,b) =>
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
        }
        
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
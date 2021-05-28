






import { createADSREditor } from "../../adsr/adsr_editor.js"
import { KEYSTRING } from "../../constants.js"

const kbHTML = `<div id="keyboard-image" class="keyboard"> <!-- The image that shows the user what keys are being pressed. --> <div class="keyboard__row"> <div class="key--double" data-not-in-use="1"></div> <div class="key--double" key-char="0"> <div>!</div> <div>1</div> </div> <div class="key--double" key-char="1"> <div>@</div> <div>2</div> </div> <div class="key--double" key-char="2"> <div>#</div> <div>3</div> </div> <div class="key--double" key-char="3"> <div>$</div> <div>4</div> </div> <div class="key--double" key-char="4"> <div>%</div> <div>5</div> </div> <div class="key--double" key-char="5"> <div>^</div> <div>6</div> </div> <div class="key--double" key-char="6"> <div>&amp;</div> <div>7</div> </div> <div class="key--double" key-char="7"> <div>*</div> <div>8</div> </div> <div class="key--double" key-char="8"> <div>(</div> <div>9</div> </div> <div class="key--double" key-char="9"> <div>)</div> <div>0</div> </div> <div class="key--double" key-char="10"> <div>_</div> <div>-</div> </div> <div class="key--double" key-char="11"> <div>+</div> <div>=</div> </div> <div class="key--bottom-right key--word key--w4" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-not-in-use="1"></div> <div class="key--letter" key-char="12">Q</div> <div class="key--letter" key-char="13">W</div> <div class="key--letter" key-char="14">E</div> <div class="key--letter" key-char="15">R</div> <div class="key--letter" key-char="16">T</div> <div class="key--letter" key-char="17">Y</div> <div class="key--letter" key-char="18">U</div> <div class="key--letter" key-char="19">I</div> <div class="key--letter" key-char="20">O</div> <div class="key--letter" key-char="21">P</div> <div class="key--double" key-char="22"> <div>{</div> <div>[</div> </div> <div class="key--double" key-char="23"> <div>}</div> <div>]</div> </div> <div class="key--double" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-not-in-use="1"></div> <div class="key--letter" key-char="24">A</div> <div class="key--letter" key-char="25">S</div> <div class="key--letter" key-char="26">D</div> <div class="key--letter" key-char="27">F</div> <div class="key--letter" key-char="28">G</div> <div class="key--letter" key-char="29">H</div> <div class="key--letter" key-char="30">J</div> <div class="key--letter" key-char="31">K</div> <div class="key--letter" key-char="32">L</div> <div class="key--double" key-char="33"> <div>:</div> <div>;</div> </div> <div class="key--double" key-char="34"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-not-in-use="1"></div> <div class="key--letter" key-char="35">Z</div> <div class="key--letter" key-char="36">X</div> <div class="key--letter" key-char="37">C</div> <div class="key--letter" key-char="38">V</div> <div class="key--letter" key-char="39">B</div> <div class="key--letter" key-char="40">N</div> <div class="key--letter" key-char="41">M</div> <div class="key--double" key-char="42"> <div>&lt;</div> <div>,</div> </div> <div class="key--double" key-char="43"> <div>&gt;</div> <div>.</div> </div> <div class="key--double" key-char="44"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-not-in-use="1"></div> </div></div>`

interface IKBGate {
    keyData : KeyDataMap
    // updateKeydata : (key : LowerCaseKeyboardKey, value : any) => void
    toggleKeyEnabled : (key : LowerCaseKeyboardKey, enable : boolean) => void
}
type LowerCaseKeyboardKey = string
enum TriggerModes { play='play', toggle='toggle' }
enum EnvelopeTypes { NONE, ATTACK_ONLY, AD, ADSR }
type Envelope = { attack : number, decay : number, sustain : number, release : number, curve : CurveType }
type KeyData = ({
    triggerMode : TriggerModes.play
    envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.AD | EnvelopeTypes.ADSR
} | {
    triggerMode : TriggerModes.toggle
    envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.ATTACK_ONLY
    active: false
}) & {
    gain : number // Defaults to 1, can be used for pitch
    adsr : Envelope
}
type KeyDataMap = Record<LowerCaseKeyboardKey, KeyData>




export class KeyboardComponent {

    container : HTMLElement

    private kbGate : IKBGate
    private keyControls : HTMLElement
    private kbImage : HTMLElement
    private getKey : Indexable<HTMLElement>
    private selectedKey = 0

    constructor(kbGate : IKBGate) {
        this.kbGate = kbGate
        
        this.keyControls = E('div')
        this.kbImage = E('div')
        this.kbImage.innerHTML = kbHTML
        this.container = E('div', { children: [this.keyControls, this.kbImage] })

        this.getKey = KEYSTRING.reduce((acc,key, i) => (
            acc[key] = this.container.querySelector(`[key-char='${i}']`)!,
            acc
            ), {} as Indexable<HTMLElement>)

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

        this.selectKey(0)
    }

    updateView() {
        for (const id in this.getKey)
        {
            const elem = this.getKey[id]
            elem.classList.toggle('enabled', id in this.kbGate.keyData)
        }
        this.showKeyControls(KEYSTRING[this.selectedKey])
    }

    private selectKey(index : number) {
        this.getKey[KEYSTRING[this.selectedKey]].classList.remove('active')
        this.selectedKey = index
        const char = KEYSTRING[this.selectedKey]
        this.getKey[char].classList.add('active')
        this.showKeyControls(char)
    }

    private showKeyControls(char : LowerCaseKeyboardKey) {
        this.keyControls.innerHTML = ''
        
        const enabled = char in this.kbGate.keyData
        const text = `${enabled ? 'dis' : 'en'}able key ${char}`
        const btn = E('span', { className: 'nice-btn', text })
        btn.onclick = () => {
            this.kbGate.toggleKeyEnabled(KEYSTRING[this.selectedKey], !enabled)
            this.showKeyControls(char)
        }
        if (enabled)
        {
            const adsr = createADSREditor(this.kbGate.keyData[char].adsr)
            this.keyControls.append(btn, adsr)
        }
    }
}
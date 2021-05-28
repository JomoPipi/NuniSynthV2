






import { createRadioButtonGroup } from '../../../UI_library/internal.js'
import { ADSR_Executor } from '../../adsr/adsr.js'
import { KB_KEYS } from '../../constants.js'
import { VolumeNodeContainer } from '../../volumenode_container.js'

// Pitch Number Property of KeyProperties
// <checkbox "1 (no pitch)" /> <checkbox [n * 100] />
// has two checkboxes, one for no pitch (appropriate for gate/percussive instruments), and another for 
//? Or we have just the formula and a drop down list of presets (for percussion + gate)

// const kbHTML = `<div class="keyboard">
// <!-- The image that shows the user what keys are being pressed.  -->
// <div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49">  <div>!</div>  <div>1</div></div><div class="key--double" data-key="50">  <div>@</div>  <div>2</div></div><div class="key--double" data-key="51">  <div>#</div>  <div>3</div></div><div class="key--double" data-key="52">  <div>$</div>  <div>4</div></div><div class="key--double" data-key="53">  <div>%</div>  <div>5</div></div><div class="key--double" data-key="54">  <div>^</div>  <div>6</div></div><div class="key--double" data-key="55">  <div>&</div>  <div>7</div></div><div class="key--double" data-key="56">  <div>*</div>  <div>8</div></div><div class="key--double" data-key="57">  <div>(</div>  <div>9</div></div><div class="key--double" data-key="48">  <div>)</div>  <div>0</div></div><div class="key--double" data-key="189">  <div>_</div>  <div>-</div></div><div class="key--double" data-key="187">  <div>+</div>  <div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w4" data-key="9"></div><div class="key--letter" data-char="Q">Q</div><div class="key--letter" data-char="W">W</div><div class="key--letter" data-char="E">E</div><div class="key--letter" data-char="R">R</div><div class="key--letter" data-char="T">T</div><div class="key--letter" data-char="Y">Y</div><div class="key--letter" data-char="U">U</div><div class="key--letter" data-char="I">I</div><div class="key--letter" data-char="O">O</div><div class="key--letter" data-char="P">P</div><div class="key--double" data-key="219" data-char="{[">  <div>{</div>  <div>[</div></div><div class="key--double" data-key="221" data-char="}]">  <div>}</div>  <div>]</div></div><div class="key--double" data-key="220" data-char="|"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w5" data-key="20"></div><div class="key--letter" data-char="A">A</div><div class="key--letter" data-char="S">S</div><div class="key--letter" data-char="D">D</div><div class="key--letter" data-char="F">F</div><div class="key--letter" data-char="G">G</div><div class="key--letter" data-char="H">H</div><div class="key--letter" data-char="J">J</div><div class="key--letter" data-char="K">K</div><div class="key--letter" data-char="L">L</div><div class="key--double" data-key="186">  <div>:</div>  <div>;</div></div><div class="key--double" data-key="222">  <div>"</div>  <div>'</div></div><div class="key--bottom-right key--word key--w5" data-key="13"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w6" data-key="16"></div><div class="key--letter" data-char="Z">Z</div><div class="key--letter" data-char="X">X</div><div class="key--letter" data-char="C">C</div><div class="key--letter" data-char="V">V</div><div class="key--letter" data-char="B">B</div><div class="key--letter" data-char="N">N</div><div class="key--letter" data-char="M">M</div><div class="key--double" data-key="188">  <div>&lt;</div>  <div>,</div></div><div class="key--double" data-key="190">  <div>&gt;</div>  <div>.</div></div><div class="key--double" data-key="191">  <div>?</div>  <div>/</div></div><div class="key--bottom-right key--word key--w6" data-key="16-R"></div></div>
// </div>`


const kbHTML = `<div class="keyboard"><!-- The image that shows the user what keys are being pressed. --><div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49"><div>!</div><div>1</div></div><div class="key--double" data-key="50"><div>@</div><div>2</div></div><div class="key--double" data-key="51"><div>#</div><div>3</div></div><div class="key--double" data-key="52"><div>$</div><div>4</div></div><div class="key--double" data-key="53"><div>%</div><div>5</div></div><div class="key--double" data-key="54"><div>^</div><div>6</div></div><div class="key--double" data-key="55"><div>&</div><div>7</div></div><div class="key--double" data-key="56"><div>*</div><div>8</div></div><div class="key--double" data-key="57"><div>(</div><div>9</div></div><div class="key--double" data-key="48"><div>)</div><div>0</div></div><div class="key--double" data-key="189"><div>_</div><div>-</div></div><div class="key--double" data-key="187"><div>+</div><div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div><div class="keyboard__row"><div class="key--bottom-left key--word key--w4" data-key="9"></div><div class="key--letter" data-char="Q">Q</div><div class="key--letter" data-char="W">W</div><div class="key--letter" data-char="E">E</div><div class="key--letter" data-char="R">R</div><div class="key--letter" data-char="T">T</div><div class="key--letter" data-char="Y">Y</div><div class="key--letter" data-char="U">U</div><div class="key--letter" data-char="I">I</div><div class="key--letter" data-char="O">O</div><div class="key--letter" data-char="P">P</div><div class="key--double" data-key="219" data-char="{["><div>{</div><div>[</div></div><div class="key--double" data-key="221" data-char="}]"><div>}</div><div>]</div></div><div class="key--double" data-key="220" data-char="|"></div></div><div class="keyboard__row"><div class="key--bottom-left key--word key--w5" data-key="20"></div><div class="key--letter" data-char="A">A</div><div class="key--letter" data-char="S">S</div><div class="key--letter" data-char="D">D</div><div class="key--letter" data-char="F">F</div><div class="key--letter" data-char="G">G</div><div class="key--letter" data-char="H">H</div><div class="key--letter" data-char="J">J</div><div class="key--letter" data-char="K">K</div><div class="key--letter" data-char="L">L</div><div class="key--double" data-key="186"><div>:</div><div>;</div></div><div class="key--double" data-key="222"><div>"</div><div>'</div></div><div class="key--bottom-right key--word key--w5" data-key="13"></div></div><div class="keyboard__row"><div class="key--bottom-left key--word key--w6" data-key="16"></div><div class="key--letter" data-char="Z">Z</div><div class="key--letter" data-char="X">X</div><div class="key--letter" data-char="C">C</div><div class="key--letter" data-char="V">V</div><div class="key--letter" data-char="B">B</div><div class="key--letter" data-char="N">N</div><div class="key--letter" data-char="M">M</div><div class="key--double" data-key="188"><div>&lt;</div><div>,</div></div><div class="key--double" data-key="190"><div>&gt;</div><div>.</div></div><div class="key--double" data-key="191"><div>?</div><div>/</div></div><div class="key--bottom-right key--word key--w6" data-key="16-R"></div></div></div>`


// const innerHTML = ``

type LowerCaseKeyboardKey = string
enum TriggerModes { play='play', toggle='toggle' }//, pick }
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

export class KeyboardGate extends VolumeNodeContainer
    implements AudioNodeInterfaces<NodeTypes.KB_GATE> {

    keyData : KeyDataMap = {}
    triggerMode = TriggerModes.play
    lastToggledKey = ''

    constructor(ctx : AudioContext) {
        super(ctx)
        this.volumeNode.gain.value = 0
    }
    
    addInput(node : NuniNode) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : NuniNode) {
        node.audioNode.disconnect(this.volumeNode)
    }

    takeKeyboardInput(keydown : boolean, key : number) {
        console.log('yo yo')
        // if ()
        ADSR_Executor.trigger(
            this.volumeNode.gain, this.ctx.currentTime, 69420,
            { attack: 0.002, decay: 0.05, sustain: 0 })

        
    }

    private controller = E('div')
    getController() {
        this.render()
        return this.controller
    }

    private render() {
        this.controller.innerHTML = ''

        const inputSelect = E('div', { text: 'mode' }) // this.getInputSelect()
        // const 
        const topRow = E('div', { children: [inputSelect], className: 'center' })

        const keyboardBox = E('div')
            keyboardBox.innerHTML = kbHTML
            for (const row of keyboardBox.children[0].children)
                for (const key of row.children)
                    // ;hjghsdfgsdfgsdfg

        // KB Gate node:
        // 2 modes - play | toggle
        // single input & mono


        keyboardBox.onclick = e => {
            const el = e.target as HTMLElement
            const p = el.parentElement!
            const get = (s : string) => el.attributes.getNamedItem(s) || p.attributes.getNamedItem(s)
            const char = get('data-char') || get('data-key')
            
            console.log('elem',char)
        }
        this.controller.append(topRow, keyboardBox)
    }

    private assignKeyData(key : LowerCaseKeyboardKey, data : KeyData) {
        this.keyData[key] = { ...this.keyData[key], ...data }
        this.render()
    }
}

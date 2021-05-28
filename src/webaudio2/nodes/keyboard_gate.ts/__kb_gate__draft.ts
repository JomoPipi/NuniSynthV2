






// import { createRadioButtonGroup } from '../../../UI_library/internal.js'
// import { ADSR_Executor } from '../../adsr/adsr.js'
// import { KB_KEYS } from '../../constants.js'
// import { VolumeNodeContainer } from '../../volumenode_container.js'

// // Pitch Number Property of KeyProperties
// // <checkbox "1 (no pitch)" /> <checkbox [n * 100] />
// // has two checkboxes, one for no pitch (appropriate for gate/percussive instruments), and another for 
// //? Or we have just the formula and a drop down list of presets (for percussion + gate)

// // const kbHTML = `<div class="keyboard">
// // <!-- The image that shows the user what keys are being pressed.  -->
// // <div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49">  <div>!</div>  <div>1</div></div><div class="key--double" data-key="50">  <div>@</div>  <div>2</div></div><div class="key--double" data-key="51">  <div>#</div>  <div>3</div></div><div class="key--double" data-key="52">  <div>$</div>  <div>4</div></div><div class="key--double" data-key="53">  <div>%</div>  <div>5</div></div><div class="key--double" data-key="54">  <div>^</div>  <div>6</div></div><div class="key--double" data-key="55">  <div>&</div>  <div>7</div></div><div class="key--double" data-key="56">  <div>*</div>  <div>8</div></div><div class="key--double" data-key="57">  <div>(</div>  <div>9</div></div><div class="key--double" data-key="48">  <div>)</div>  <div>0</div></div><div class="key--double" data-key="189">  <div>_</div>  <div>-</div></div><div class="key--double" data-key="187">  <div>+</div>  <div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w4" data-key="9"></div><div class="key--letter" data-char="Q">Q</div><div class="key--letter" data-char="W">W</div><div class="key--letter" data-char="E">E</div><div class="key--letter" data-char="R">R</div><div class="key--letter" data-char="T">T</div><div class="key--letter" data-char="Y">Y</div><div class="key--letter" data-char="U">U</div><div class="key--letter" data-char="I">I</div><div class="key--letter" data-char="O">O</div><div class="key--letter" data-char="P">P</div><div class="key--double" data-key="219" data-char="{[">  <div>{</div>  <div>[</div></div><div class="key--double" data-key="221" data-char="}]">  <div>}</div>  <div>]</div></div><div class="key--double" data-key="220" data-char="|"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w5" data-key="20"></div><div class="key--letter" data-char="A">A</div><div class="key--letter" data-char="S">S</div><div class="key--letter" data-char="D">D</div><div class="key--letter" data-char="F">F</div><div class="key--letter" data-char="G">G</div><div class="key--letter" data-char="H">H</div><div class="key--letter" data-char="J">J</div><div class="key--letter" data-char="K">K</div><div class="key--letter" data-char="L">L</div><div class="key--double" data-key="186">  <div>:</div>  <div>;</div></div><div class="key--double" data-key="222">  <div>"</div>  <div>'</div></div><div class="key--bottom-right key--word key--w5" data-key="13"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w6" data-key="16"></div><div class="key--letter" data-char="Z">Z</div><div class="key--letter" data-char="X">X</div><div class="key--letter" data-char="C">C</div><div class="key--letter" data-char="V">V</div><div class="key--letter" data-char="B">B</div><div class="key--letter" data-char="N">N</div><div class="key--letter" data-char="M">M</div><div class="key--double" data-key="188">  <div>&lt;</div>  <div>,</div></div><div class="key--double" data-key="190">  <div>&gt;</div>  <div>.</div></div><div class="key--double" data-key="191">  <div>?</div>  <div>/</div></div><div class="key--bottom-right key--word key--w6" data-key="16-R"></div></div>
// // </div>`

// const kbHTML = `<div class="keyboard"><!-- The image that shows the user what keys are being pressed. --><div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49"><div>!</div><div>1</div></div><div class="key--double" data-key="50"><div>@</div><div>2</div></div><div class="key--double" data-key="51"><div>#</div><div>3</div></div><div class="key--double" data-key="52"><div>$</div><div>4</div></div><div class="key--double" data-key="53"><div>%</div><div>5</div></div><div class="key--double" data-key="54"><div>^</div><div>6</div></div><div class="key--double" data-key="55"><div>&</div><div>7</div></div><div class="key--double" data-key="56"><div>*</div><div>8</div></div><div class="key--double" data-key="57"><div>(</div><div>9</div></div><div class="key--double" data-key="48"><div>)</div><div>0</div></div><div class="key--double" data-key="189"><div>_</div><div>-</div></div><div class="key--double" data-key="187"><div>+</div><div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div><!-- <br> --> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-key="9"></div> <div class="key--letter" data-char="Q">Q</div> <div class="key--letter" data-char="W">W</div> <div class="key--letter" data-char="E">E</div> <div class="key--letter" data-char="R">R</div> <div class="key--letter" data-char="T">T</div> <div class="key--letter" data-char="Y">Y</div> <div class="key--letter" data-char="U">U</div> <div class="key--letter" data-char="I">I</div> <div class="key--letter" data-char="O">O</div> <div class="key--letter" data-char="P">P</div> <div class="key--double" data-key="219" data-char="{["> <div>{</div> <div>[</div> </div> <div class="key--double" data-key="221" data-char="}]"> <div>}</div> <div>]</div> </div> <div class="key--double" data-key="220" data-char="|"></div> </div> <!-- <br> --> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-key="20"></div> <div class="key--letter" data-char="A">A</div> <div class="key--letter" data-char="S">S</div> <div class="key--letter" data-char="D">D</div> <div class="key--letter" data-char="F">F</div> <div class="key--letter" data-char="G">G</div> <div class="key--letter" data-char="H">H</div> <div class="key--letter" data-char="J">J</div> <div class="key--letter" data-char="K">K</div> <div class="key--letter" data-char="L">L</div> <div class="key--double" data-key="186"> <div>:</div> <div>;</div> </div> <div class="key--double" data-key="222"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-key="13"></div> </div> <!-- <br> --> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-key="16"></div> <div class="key--letter" data-char="Z">Z</div> <div class="key--letter" data-char="X">X</div> <div class="key--letter" data-char="C">C</div> <div class="key--letter" data-char="V">V</div> <div class="key--letter" data-char="B">B</div> <div class="key--letter" data-char="N">N</div> <div class="key--letter" data-char="M">M</div> <div class="key--double" data-key="188"> <div>&lt;</div> <div>,</div> </div> <div class="key--double" data-key="190"> <div>&gt;</div> <div>.</div> </div> <div class="key--double" data-key="191"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-key="16-R"></div> </div></div>`

// // const innerHTML = ``

// type LowerCaseKeyboardKeys = string
// enum TriggerModes { play, toggle, pick }
// enum EnvelopeTypes { NONE, ATTACK_ONLY, AD, ADSR }
// type Envelope = { attack : number, decay : number, sustain : number, release : number, curve : CurveType }
// type KeyData = ({
//     triggerMode : TriggerModes.play
//     envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.AD | EnvelopeTypes.ADSR
// } | {
//     triggerMode : TriggerModes.toggle
//     envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.ATTACK_ONLY
//     active: false
// } | {
//     triggerMode : TriggerModes.pick
//     envelopeType : EnvelopeTypes.AD
// }) & {
//     gain : number // Defaults to 1, can be used for pitch
//     adsr : Envelope
// }
// type KeyDataMap = Record<LowerCaseKeyboardKeys, KeyData>

// type NuniGraphNodeID = number

// type EnvelopeID = string // `${NuniGraphNodeID}:${LowerCaseKeyboardKeys}`

// export class KeyboardGate extends VolumeNodeContainer {
//     // implements AudioNodeInterfaces<NodeTypes.KB_GATE__MULTI_INPUT__DRAFT> {
    
//     private _inputData : Record<NuniGraphNodeID, KeyDataMap> = {}
//     get inputData() { return this._inputData }
//     set inputData(d) {
// //* Problem: when `inputData` is assigned from the outside, 
// //* any `active` (toggle mode) `KeyData`
// //* will need to be reactivated
//         this._inputData = d
//         for (const id in d)
//         {
//             const keymap = d[id]
//             for (const key in keymap)
//             {
//                 const keydata = keymap[key]
//                 if (keydata.triggerMode === TriggerModes.toggle && keydata.active)
//                 {
//                     const envID = `${id}:${key}`
//                     const envelope = this.envelopes[envID] = this.ctx.createGain()
//                     envelope.connect(this.volumeNode)
//                     this.inputNodes[id].connect(envelope)
//                 }
//             }
//         }

//     }
//     mono : boolean = false
    
//     private inputNodes : Record<NuniGraphNodeID, BaseAudioNodeProperties> = {}
//     private envelopes : Record<EnvelopeID, GainNode> = {}

//     addInput({ id, audioNode } : NuniNode) {
//         this.inputNodes[id] = audioNode
//         this.render()
//     }

//     removeInput({ id, audioNode } : NuniNode) {
//         delete this.inputData[id]
//         delete this.inputNodes[id]
//         this.render()
//     }

//     hasInput({ id } : NuniNode) {
//         return id in this.inputData
//     }

//     replaceInput({ id, audioNode } : NuniNode, newNode : NuniNode) {

//         this.addInput(newNode)
//         this.inputData[newNode.id] = this.inputData[id]
//         this.removeInput({ id, audioNode })
//     }

//     takeKeyboardInput(keydown : boolean, key : number) {
//         for (const id in this.inputData)
//         {
//             const data : KeyDataMap = this.inputData[id as any]
//             if (data[key])
//             {
//                 const envID = `${id}:${key}`
//                 const { attack, decay, sustain, release, curve } = data[key].adsr
//                 const envelope = this.envelopes[envID] 
//                     || (this.envelopes[envID] = this.ctx.createGain())
//                 switch (data[key].triggerMode)
//                 {
//                     case TriggerModes.pick:
//                         ADSR_Executor.trigger(
//                             envelope.gain, this.ctx.currentTime, 69420,
//                             { attack, decay, sustain: 0 })
//                         break
                    
//                     case TriggerModes.play:
//                         if (keydown)
//                         {
//                             ADSR_Executor.trigger(
//                                 envelope.gain, this.ctx.currentTime, 69420, data[key].adsr)
//                         }
//                         else
//                         {
//                             const t = ADSR_Executor.untriggerAndGetReleaseLength(
//                                 envelope.gain, this.ctx.currentTime, 69420, data[key].adsr)

//                             // setTimeout(() => , t * 1000)
//                         }

//                     case TriggerModes.toggle:
//                         break
//                 }
//             }
//         }
//     }

//     private controller = E('div')
//     getController() {
//         this.render()
//         return this.controller
//     }

//     private render() {
//         this.controller.innerHTML = ''

//         const inputSelect = this.getInputSelect()
//         const topRow = E('div', { children: [inputSelect], className: 'center' })

//         const keyboardBox = E('div')
//             keyboardBox.innerHTML = kbHTML

//         keyboardBox.onclick = e => {
//             const el = e.target as HTMLElement
//             const p = el.parentElement!
//             const get = (s : string) => el.attributes.getNamedItem(s) || p.attributes.getNamedItem(s)
//             const char = get('data-char') || get('data-key')


//             console.log('elem',char)
//         }
//         this.controller.append(topRow, keyboardBox)
//     }

//     private getInputSelect() {
//         return Object.keys(this.inputData).length === 0
//             ? E('span', { text: 'No inputs available' })
//             : createRadioButtonGroup({ buttons: Object.keys(this.inputData), selected: 0 })
//             // : E('div', { text: Object.keys(this.inputData).join(', ') })
//     }
// }

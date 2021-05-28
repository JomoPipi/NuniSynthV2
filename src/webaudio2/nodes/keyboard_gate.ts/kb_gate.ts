






import { createRadioButtonGroup } from '../../../UI_library/internal.js'
import { ADSR_Executor } from '../../adsr/adsr.js'
import { KB_KEYS, KEYSTRING } from '../../constants.js'
import { VolumeNodeContainer } from '../../volumenode_container.js'
import { KeyboardComponent } from './kbcomponent.js'




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




export class KeyboardGate extends VolumeNodeContainer
    implements AudioNodeInterfaces<NodeTypes.KB_GATE> {

    private _keyData : KeyDataMap = {}
    get keyData() { return this._keyData }
    set keyData(d) { 
        this._keyData = d
        this.kbcomponent.updateView()
    }
    triggerMode = TriggerModes.play
    lastToggledKey = ''

    private kbcomponent : KeyboardComponent

    constructor(ctx : AudioContext) {
        super(ctx)
        this.volumeNode.gain.value = 0
        this.kbcomponent = new KeyboardComponent(this)
    }
    
    addInput(node : NuniNode) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : NuniNode) {
        node.audioNode.disconnect(this.volumeNode)
    }

    takeKeyboardInput(keydown : boolean, key : number) {
        // console.log('yo yo', key, KEYSTRING[key])
        if (this.keyData[KEYSTRING[key]])
        {
            ADSR_Executor[keydown ? 'trigger' : 'untriggerAdsr'](
                this.volumeNode.gain, this.ctx.currentTime, 69420,
                this.keyData[KEYSTRING[key]].adsr)

                // { attack: 0.002, decay: 0.05, sustain: 0 })
        }
    }

    private controller? : HTMLElement
    getController() {
        if (this.controller) return this.controller

        this.controller = E('div')

        const inputSelect = E('div', { text: 'mode: ' + this.triggerMode })
        const topRow = E('div', { children: [inputSelect], className: 'center' })

        this.controller.append(topRow, this.kbcomponent.container)

        return this.controller
    }

    toggleKeyEnabled(key : LowerCaseKeyboardKey, enabled : boolean) {
        if (enabled)
        {
            this.keyData[key] =
                { triggerMode: TriggerModes.play
                , envelopeType: EnvelopeTypes.ADSR
                , gain: 1
                , adsr: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3, curve: 'S' }
                }
        }
        else
        {
            delete this.keyData[key]
        }
        this.kbcomponent.updateView()
    }

    private assignKeyData(key : LowerCaseKeyboardKey, data : KeyData) {
        this.keyData[key] = { ...this.keyData[key], ...data }
    }
}







import { createRadioButtonGroup } from '../../../UI_library/internal.js'
import { ADSR_Executor } from '../../adsr/adsr.js'
import { KB_KEYS, KEYSTRING } from '../../constants.js'
import { VolumeNodeContainer } from '../../volumenode_container.js'
import { KeyboardController } from './kbcontroller.js'




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

    private kbcomponent : KeyboardController

    constructor(ctx : AudioContext) {
        super(ctx)
        this.volumeNode.gain.value = 0
        this.kbcomponent = new KeyboardController(this)
    }
    
    addInput(node : NuniNode) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : NuniNode) {
        node.audioNode.disconnect(this.volumeNode)
    }

    takeKeyboardInput(keydown : boolean, key : number) {
        // console.log('yo yo', key, KEYSTRING[key])
        const data = this.keyData[KEYSTRING[key]]
        if (data)
        {
            const { adsr, envelopeType, gain } = data
            if (this.triggerMode === TriggerModes.toggle)
            {
                if (!keydown) return;
                const thisKeyIsOnAlready = this.lastToggledKey === KEYSTRING[key]
                ADSR_Executor.attackTrigger(
                    this.volumeNode.gain, this.ctx.currentTime, adsr, thisKeyIsOnAlready ? 0 : data.gain)
                
                this.lastToggledKey = thisKeyIsOnAlready ? '' : KEYSTRING[key]
            }
            else
            {
                ADSR_Executor[keydown ? 'trigger' : 'untriggerAdsr'](
                    this.volumeNode.gain, this.ctx.currentTime, 69420, adsr, data.gain)
            }

                // { attack: 0.002, decay: 0.05, sustain: 0 })
        }
    }

    getController() {
        return this.kbcomponent.container
    }

    toggleKeyEnabled(key : LowerCaseKeyboardKey, enabled : boolean) {
        if (enabled)
        {
            this.keyData[key] =
                { envelopeType: EnvelopeTypes.ADSR
                , gain: 1
                , adsr: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3, curve: 'S' }
                }
        }
        else
        {
            delete this.keyData[key]
        }
    }

    private assignKeyData(key : LowerCaseKeyboardKey, data : KeyData) {
        this.keyData[key] = { ...this.keyData[key], ...data }
    }
}







import { createNumberDialComponent3 } from "../../../UI_library/internal.js"







export class NuniNumberNode extends ConstantSourceNode {

    private controller? : HTMLElement
    private numberValue = 0

    constructor(ctx : AudioContext) {
        super(ctx)
        this.offset.value = 0
        this.start(ctx.currentTime)
    }

    getController() {
        if (this.controller) return this.controller

        this.controller = E('div', { className: 'audioparam-container' })
        
        const updateFunc = (newValue : number) => {
            this.numberValue = newValue
            this.offset.value = newValue
        }

        const param = 'offset'
        const settings = 
            { amount: AudioParamSliderFactor[param]
            , min: AudioParamRanges[param][0]
            , max: AudioParamRanges[param][1]
            , isLinear: hasLinearSlider[param]
            }

        const rounds = AudioParamKnobTurns[param]
        const numberInput = 
            createNumberDialComponent3(this.numberValue, updateFunc, settings, rounds)
        
        const box = E('div', { className: 'audioparam-container' })
        box.append(numberInput.container)

        this.controller.appendChild(numberInput.container)

        return this.controller
    }
}
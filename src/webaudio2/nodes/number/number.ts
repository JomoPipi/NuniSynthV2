






import { OpenGraphControllers } from "../../../nunigraph/controller/graph_controller.js"
import { createSliderComponent } from "../../../UI_library/components/sliderComponent.js"
import { createSVGIcon } from "../../../UI_library/components/svg_icon.js"
import { createNumberDialComponent3, createSVGRadioGroup } from "../../../UI_library/internal.js"







const buttonKeys = 
    [ 'knob'
    , 'slider'
    , 'button'
    ] as const
type Mode = typeof buttonKeys[number]

export class NuniNumberNode extends ConstantSourceNode
    implements AudioNodeInterfaces<NodeTypes.NUM> {

    private controller? : HTMLElement
    private numberValue = 0
    private nodeIcon : Mode = 'knob'

    constructor(ctx : AudioContext) {
        super(ctx)
        this.offset.value = 0
        this.start(ctx.currentTime)
    }

    get mode() { return this.nodeIcon }
    set mode(mode : Mode) {
        this.nodeIcon = mode
        for (const controller of OpenGraphControllers.list)
        {
            if (controller.g.nodes.some(({ audioNode }) => audioNode === this))
            {
                controller.renderer.render()
                break
            }
        }
    }

    getController() {
        if (this.controller) return this.controller

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
            , rounds: AudioParamKnobTurns[param]
            }
            
        const numberInput = createNumberDialComponent3(this.numberValue, updateFunc, settings)
            numberInput.container.classList.add('hide')

        const slider = createSliderComponent(this.numberValue, updateFunc)
            slider.container.classList.add('hide')

        const beatButton = createSVGIcon('button', 50)
            beatButton.classList.add('hide', 'push-button')
            beatButton.onmousedown = () => updateFunc(1)
            beatButton.onmouseup = () => updateFunc(0)

        const components = [numberInput.container, slider.container, beatButton]
        const controllerContainer = E('div', { children: components })

        const showComponent = (mode : Mode) => {
            const toComponent = 
                { knob: numberInput.container
                , slider: slider.container
                , button: beatButton
                }
            for (const component of components)
            {
                component.classList.toggle('hide', toComponent[mode] !== component)
            }
            if (mode === 'slider') slider.setMax((this.numberValue || 1).toString())
            else if (mode === 'knob') numberInput.setValue(this.numberValue)
            else if (mode === 'button') updateFunc(0)
        }
        showComponent('knob')
            
        this.controller = E('div',
            { className: 'audioparam-container'
            , children:
                [ createSVGRadioGroup(
                    { buttons: buttonKeys as unknown as string[]
                    , selected: 0
                    ,
                        onclick : (mode : Mode, index : number) => {
                            this.mode = mode
                            showComponent(mode)
                        }
                    })
                , E('br')
                , E('br')
                , controllerContainer
                ]
            })

        return this.controller
    }

    getNodeIcon() {
        return this.nodeIcon
    }
}


// playStepAtTime(id : number, time : number) {  

//     // AD : Overlap-toggle

//     const adsr = this.channelEnvelopes[id]
//     const gain = adsr.gain
//     const duration = this.tick
//     ADSR_Controller.trigger(gain, time, this.adsrIndex, this.localADSR)
//     ADSR_Controller.untriggerAdsr(gain, time + duration, this.adsrIndex, this.localADSR)
// }
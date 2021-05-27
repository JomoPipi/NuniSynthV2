






// import { OpenGraphControllers } from "../../../nunigraph/controller/graph_controller.js"
// import { createSliderComponent } from "../../../UI_library/components/sliderComponent.js"
// import { createSVGIcon } from "../../../UI_library/components/svg_icon.js"
// import { createNumberDialComponent3, createSVGRadioGroup } from "../../../UI_library/internal.js"
// import { ADSR_Executor } from "../../adsr/adsr.js"
// import { createADSREditor } from "../../adsr/adsr_editor.js"







// const buttonKeys = 
//     [ 'knob'
//     , 'slider'
//     , 'button'
//     ] as const
// type Mode = typeof buttonKeys[number]

// export class NuniNumberNode extends ConstantSourceNode
//     implements AudioNodeInterfaces<NodeTypes.NUM> {

//     private controller? : HTMLElement
//     private numberValue = 0
//     private nodeIcon : Mode = 'knob'

//     constructor(ctx : AudioContext) {
//         super(ctx)
//         this.offset.value = 0
//         this.start(ctx.currentTime)
//     }

//     get mode() { return this.nodeIcon }
//     set mode(mode : Mode) {
//         this.nodeIcon = mode
//         for (const controller of OpenGraphControllers.list)
//         {
//             if (controller.g.nodes.some(({ audioNode }) => audioNode === this))
//             {
//                 controller.renderer.render()
//                 break
//             }
//         }
//     }

//     getController() {
//         if (this.controller) return this.controller

//         const updateFunc = (newValue : number) => {
//             this.numberValue = newValue
//             this.offset.value = newValue
//         }

//         const param = 'offset'
//         const settings = 
//             { amount: AudioParamSliderFactor[param]
//             , min: AudioParamRanges[param][0]
//             , max: AudioParamRanges[param][1]
//             , isLinear: hasLinearSlider[param]
//             , rounds: AudioParamKnobTurns[param]
//             }
            
//         const numberInput = createNumberDialComponent3(this.numberValue, updateFunc, settings)
//             numberInput.container.classList.add('hide')

//         const slider = createSliderComponent(this.numberValue, updateFunc)
//             slider.container.classList.add('hide')

//         const beatpad = this.createBeatpad()
//             beatpad.classList.add('hide')

//         const components = [numberInput.container, slider.container, beatpad]
//         const controllerContainer = E('div', { children: components })

//         const showComponent = (mode : Mode) => {
//             const toComponent = 
//                 { knob: numberInput.container
//                 , slider: slider.container
//                 , button: beatpad
//                 }
//             for (const component of components)
//             {
//                 component.classList.toggle('hide', toComponent[mode] !== component)
//             }
//             if (mode === 'slider') slider.setMax((this.numberValue || 1).toString())
//             else if (mode === 'knob') numberInput.setValue(this.numberValue)
//             else if (mode === 'button') updateFunc(0)
//         }
//         showComponent('knob')
            
//         this.controller = E('div',
//             { className: 'audioparam-container'
//             , children:
//                 [ createSVGRadioGroup(
//                     { buttons: buttonKeys as unknown as string[]
//                     , selected: 0
//                     ,
//                         onclick : (mode : Mode, index : number) => {
//                             this.mode = mode
//                             showComponent(mode)
//                         }
//                     })
//                 , E('br')
//                 , E('br')
//                 , controllerContainer
//                 ]
//             })

//         return this.controller
//     }

//     getNodeIcon() {
//         return this.nodeIcon
//     }

//     private createBeatpad() {
        
//         const adsrValues = 
//             { attack: 0.010416984558105469
//             , decay: 0.17708349227905273
//             , sustain: 0.2166603088378906
//             , release: 0.3812504768371582
//             , curve: 'exponential' as const
//             }

//         const beatButton = createSVGIcon('button', 50)
//             beatButton.classList.add('push-button')
//             beatButton.onmousedown = () => 
//                 ADSR_Executor.trigger(this.offset, this.context.currentTime, -1, adsrValues)
//             beatButton.onmouseup = () => 
//                 ADSR_Executor.untriggerAdsr(this.offset, this.context.currentTime, -1, adsrValues)

//         const adsrComponent = createADSREditor(adsrValues)

//         const container = E('div', 
//             { className: 'hide'
//             , children: [beatButton, E('br'), adsrComponent] 
//             })

//         return container
//     }
// }
import { NuniGraphController } from "../nunigraph/controller/graph_controller.js" // <- A CIRCULAR REFERENCE POINT
import VolumeNodeContainer from "./volumenode_container.js"
// type NuniGraphController = Indexed // <- turn this one on when using npx madge --circular --extensions ts ./





export default class NuniGraphAudioNode extends VolumeNodeContainer {
    static createController? : (canvas : HTMLCanvasElement) => NuniGraphController

    canvas : HTMLCanvasElement
    controller : NuniGraphController

    constructor(ctx : AudioContext) {
        super(ctx)
        this.canvas = E('canvas', {
            className: 'nunigraph-canvas--custom',
            })
        
        if (NuniGraphAudioNode.createController) 
            this.controller = NuniGraphAudioNode.createController(this.canvas)
        else 
            throw 'Why is create controller undefined'

        this.controller
            .g.nodes.find(node => node.id === 0)!
            .audioNode
            .connect(this.volumeNode)

        // this.windowIsOpen = false
    }

    // connect(node : Destination){

    // }

    // disconnect(){}

    activateWindow() {
        this.controller.activateEventHandlers()
    }

    deactivateWindow() {
        this.controller.deactivateEventHandlers()
        this.controller.closeAllWindows()
    }
}
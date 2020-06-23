import { NuniGraphController } from "../nunigraph/controller/graph_controller" // <- A CIRCULAR REFERENCE POINT






export default class NuniGraphAudioNode {
    static createController? : (canvas : HTMLCanvasElement) => NuniGraphController

    ctx : AudioContext

    canvas : HTMLCanvasElement
    controller : NuniGraphController

    constructor(ctx : AudioContext) {
        this.ctx = ctx
        this.canvas = E('canvas', {
            className: 'nunigraph-canvas--custom',
            })
        
        if (NuniGraphAudioNode.createController) 
            this.controller = NuniGraphAudioNode.createController(this.canvas)
        else 
            throw 'Why is create controller undefined'

    }

    connect(){}

    disconnect(){}

    activateWindow() {
        this.controller.activateEventHandlers()
    }

    deactivateWindow() {
        this.controller.deactivateEventHandlers()
    }
}
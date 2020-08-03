






import { NuniGraphController } from "../nunigraph/controller/graph_controller.js" // <- A CIRCULAR REFERENCE POINT
import { VolumeNodeContainer } from "./volumenode_container.js"
// TODO create interface for NuniGraphController to remove the circularity?
// type NuniGraphController = any // <- turn this one on when using npx madge --circular --extensions ts ./





export class NuniGraphAudioNode extends VolumeNodeContainer {
    static createController? : (canvas : HTMLCanvasElement, vol : GainNode) => NuniGraphController

    canvas : HTMLCanvasElement
    controller : NuniGraphController
    inputs : Indexed // NuniGraphNode<GAIN>
    private _windowIsOpen : boolean

    constructor(ctx : AudioContext) {
        super(ctx) 
        this.canvas = E('canvas', { className: 'nunigraph-canvas--custom' })
        
        if (NuniGraphAudioNode.createController) 
            this.controller = NuniGraphAudioNode.createController(this.canvas, this.volumeNode)
        else 
            throw 'Why is create controller undefined'

        this.inputs = {}
        this._windowIsOpen = false
    }

    activateWindow() {
        this.controller.activateEventHandlers()
        this._windowIsOpen = true
    }

    deactivateWindow() {
        this.controller.deactivateEventHandlers()
        this.controller.closeAllWindows()
        this._windowIsOpen = false
    }

    get graphCode() {
        return this.controller.g.toString()
    }
    set graphCode(code : string) {
        this.controller.fromString(code)
    }

    
    addInput(
        { id, audioNode } : { id : number, audioNode : Indexed }) {

        const inputNode 
            = this.controller
                .g.nodes
                .find(node => node.INPUT_NODE_ID?.id === id)

        if (inputNode) 
        {
            audioNode.connect(inputNode.audioNode)
        }
        else 
        {
            const inputNode 
                = this.inputs[id]
                = this.controller.g.createNewNode(NodeTypes.GAIN, 
                { x: Math.random() * .5 + .25 
                , y: Math.random() * .5 + .25
                , audioParamValues: { gain: 1 }
                , audioNodeProperties: {}
                , title: `INPUT (id-${id})`
                , INPUT_NODE_ID: { id }
                })
            
            audioNode.connect(inputNode.audioNode)
        }
        if (this._windowIsOpen) 
        {
            this.controller.renderer.render()
        }
    }

    removeInput({ id } : { id : number }) {
        const inputNode = this.inputs[id]
        inputNode.audioNode.disconnect()
        this.controller.renderer.removeFromConnectionsCache(inputNode.id)
        this.controller.g.deleteNode(inputNode) // NuniGraphNode
        delete this.inputs[id]
        
        if (this._windowIsOpen)
        {
            this.controller.renderer.render()
        }
    }
}
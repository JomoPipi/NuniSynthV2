






import { NuniGraphController } from "../../../nunigraph/controller/graph_controller.js" // <- A CIRCULAR REFERENCE POINT
import { VolumeNodeContainer } from "../../volumenode_container.js"
// TODO create interface for NuniGraphController to remove the circularity?
// type NuniGraphController = any // <- turn this one on when using npx madge --circular --extensions ts ./




interface NuniNode { id : number, audioNode : Indexed }

export class NuniGraphAudioNode extends VolumeNodeContainer {

    static createController? : (canvas : HTMLCanvasElement, vol : GainNode) => NuniGraphController

    canvas : HTMLCanvasElement
    controller : NuniGraphController
    inputs : Indexed // NuniGraphNode<GAIN>
    private dialogBoxIsOpen : boolean

    constructor(ctx : AudioContext) {
        super(ctx) 
        this.canvas = E('canvas', { className: 'nunigraph-canvas--module' })
        
        if (NuniGraphAudioNode.createController) 
            this.controller = NuniGraphAudioNode.createController(this.canvas, this.volumeNode)
        else 
            throw 'Why is create controller undefined'

        this.inputs = {}
        this.dialogBoxIsOpen = false
    }

    activateWindow() {
        this.controller.activateEventHandlers()
        this.dialogBoxIsOpen = true
    }

    deactivateWindow() {
        this.controller.deactivateEventHandlers()
        this.controller.closeAllWindows()
        this.dialogBoxIsOpen = false
    }

    get graphCode() {
        return this.controller.g.toString()
    }
    set graphCode(code : string) {
        this.controller.fromString(code)
    }

    
    addInput({ id, audioNode } : NuniNode) {

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
                { x: Math.random() < 0.5 ? 0.05 : 0.95
                , y: Math.random()
                , audioParamValues: { gain: 1 }
                , audioNodeProperties: {}
                , title: `INPUT (id-${id})`
                , INPUT_NODE_ID: { id }
                })
            
            audioNode.connect(inputNode.audioNode)
        }
        if (this.dialogBoxIsOpen) 
        {
            this.controller.renderer.render()
        }
    }

    removeInput({ id } : NuniNode) {
        const inputNode = this.inputs[id]
        inputNode.audioNode.disconnect()
        this.controller.renderer.removeFromConnectionsCache(inputNode.id)
        this.controller.g.deleteNode(inputNode) // NuniGraphNode
        delete this.inputs[id]
        
        if (this.dialogBoxIsOpen)
        {
            this.controller.renderer.render()
        }
    }

    replaceInput({ id, audioNode } : NuniNode, newNode : NuniNode) {
        const inputNode 
            = this.controller
                .g.nodes
                .find(node => node.INPUT_NODE_ID?.id === id)

        if (inputNode) 
        {
            audioNode.disconnect(inputNode.audioNode)
            newNode.audioNode.connect(inputNode.audioNode)

            inputNode.title = `INPUT (id-${newNode.id})`
            inputNode.INPUT_NODE_ID!.id = newNode.id

            this.inputs[newNode.id] = this.inputs[id]
            delete this.inputs[id]
        }
        else
        {
            throw 'inputNode should be there'
        }
        if (this.dialogBoxIsOpen) 
        {
            this.controller.renderer.render()
        }
    }
}
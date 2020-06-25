import { NuniGraphController } from "../nunigraph/controller/graph_controller.js" // <- A CIRCULAR REFERENCE POINT
import VolumeNodeContainer from "./volumenode_container.js"
// type NuniGraphController = Indexed // <- turn this one on when using npx madge --circular --extensions ts ./





export default class NuniGraphAudioNode extends VolumeNodeContainer {
    static createController? : (canvas : HTMLCanvasElement) => NuniGraphController

    canvas : HTMLCanvasElement
    controller : NuniGraphController
    inputs : Indexed // NuniGraphNode<GAIN>

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

        this.inputs = {}
    }

    activateWindow() {
        this.controller.activateEventHandlers()
    }

    deactivateWindow() {
        this.controller.deactivateEventHandlers()
        this.controller.closeAllWindows()
    }

    get graphCode() {
        return this.controller.g.toRawString()
    }
    set graphCode(code : string) {
        this.controller.g.fromRawString(code)
    }

    
    addInput(
        { id, audioNode } : { id : number, audioNode : Indexed }) {

        const inputNode 
            = this.inputs[id]
            = this.controller.g.createNewNode(NodeTypes.GAIN, {
            display: { x: Math.random(), y: Math.random() },
            audioParamValues: { gain: 1 },
            audioNodeProperties: {},
            title: `INPUT (id-${id})`,
            isAnInputNode: true,
            })
        
        audioNode.connect(inputNode.audioNode)
    }

    removeInput({ id } : { id: number }) {
        const inputNode= this.inputs[id]
        inputNode.audioNode.disconnect()
        this.controller.g.deleteNode(inputNode as any) // NuniGraphNode
        delete this.inputs[id]
    }
}







import { NuniGraphRenderer } from './view/graph_renderer.js'
import { NuniGraph } from './model/nunigraph.js'
import { KB } from '../webaudio2/note_in/keyboard.js'
import { MasterClock } from '../webaudio2/sequencers/master_clock.js'
import { BufferUtils } from '../buffer_utils/internal.js'
import { audioCtx } from '../webaudio2/webaudio2.js'
import { NuniGraphController, ActiveControllers } from './controller/graph_controller.js'
import { NuniSourceNode } from '../webaudio2/note_in/nuni_source_node.js'
import { BufferNode2 } from '../webaudio2/note_in/buffer2.js'
import { createValuesWindow } from './view/display_nodedata.js'
import { Sequencer } from '../webaudio2/sequencers/sequencer.js'
import { NuniGraphAudioNode } from '../webaudio2/nunigraph_audionode.js'




class Nuni extends NuniGraphController {

    volumeNode : GainNode

    constructor(canvas : HTMLCanvasElement, volumeNode : GainNode) {
        const G = new NuniGraph()

        super(
            G, 
            D('connection-type-prompt')!,
            new NuniGraphRenderer(
                G, 
                canvas,
                ),
            createValuesWindow
            )
        
        
        G.nodes
            .find(({ id }) => id === 0)!
            .audioNode
            .connect(volumeNode)

        this.volumeNode = volumeNode
    }
}

NuniGraphAudioNode.createController = // Nuni
    (canvas : HTMLCanvasElement, volumeNode : GainNode) => new Nuni(canvas, volumeNode)

export const GraphController 
    = new Nuni(D('nunigraph-canvas') as HTMLCanvasElement, audioCtx.volume)

GraphController.activateEventHandlers()
// GraphController
//     .g
//     .nodes
//     .find(({ id }) => id === 0)!
//     .audioNode
//     .connect(audioCtx.volume)

;(<any>window).cmap = GraphController.g.oneWayConnections

ActiveControllers.push(GraphController)




Graph_Attachments: {
    const g = GraphController.g

    function* yeildNodes(g : NuniGraph) : Generator {
        for (const { audioNode: an } of g.nodes) {
            if (an instanceof NuniGraphAudioNode) {
                yield* yeildNodes(an.controller.g)
            } else {
                yield an
            }
        }
    }
    
    KB.attachToGraph(function*() {
        for (const an of yeildNodes(g)) {
            if (an instanceof NuniSourceNode) { // && an.kbMode !== 'none') {
                yield an
            }
        }
    })

    MasterClock.setSchedule((tempo : number) => {
        for (const an of yeildNodes(g)) {
            if (an instanceof Sequencer) {
                an.scheduleNotes(tempo)
            }
        }
    })

    BufferUtils.initBufferPresets(audioCtx)
    BufferUtils.setRefreshBufferFunc((index : number) => {
        for (const an of yeildNodes(g)) {
            if (an instanceof BufferNode2 && an.bufferKey === index) {
                an.refresh()
            }
        }
    })
}
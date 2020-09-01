






import { NuniGraphRenderer } from './view/graph_renderer.js'
import { NuniGraph } from './model/nunigraph.js'
import { BufferUtils } from '../buffer_utils/internal.js'
import { NuniGraphController, ActiveControllers } from './controller/graph_controller.js'

import 
    { KB, audioCtx, Sequencer, BufferNode2
    , MasterClock, NuniSourceNode, NuniGraphAudioNode
    } from '../webaudio2/internal.js'
import { snapToGrid } from './view/snap_to_grid.js'

    
    
class Nuni extends NuniGraphController {

    volumeNode : GainNode

    constructor(canvas : HTMLCanvasElement, volumeNode : GainNode) {
        const G = new NuniGraph()

        super
            ( G 
            , D('connection-type-prompt')
            , new NuniGraphRenderer(G, canvas))
        
        
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
GraphController.g.nodes[0].setValueOfParam('gain', 0.125)

ActiveControllers.push(GraphController)

snapToGrid.attach(() => ActiveControllers.forEach(c => c.renderer.render()))

let DEBUG = true
if (DEBUG) 
{
    (<any>window).controller = GraphController
}

Graph_Attachments: {

    // break Graph_Attachments // <- comment this in for testing

    const g = GraphController.g

    function* yeildNodes(g : NuniGraph) : Generator {
        for (const { audioNode } of g.nodes) 
        {
            if (audioNode instanceof NuniGraphAudioNode)
            {
                yield* yeildNodes(audioNode.controller.g)
            } 
            else 
            {
                yield audioNode
            }
        }
    }
    if (DEBUG) 
    {
        (<any>window).getNodes = () => [...yeildNodes(g)]
    }
    
    KB.attachToGraph(function*() {
        for (const an of yeildNodes(g)) 
        {
            if (an instanceof NuniSourceNode) 
            { // && an.kbMode !== 'none') {
                yield an
            }
        }
    })

    MasterClock.setSchedule((tempo : number) => {
        for (const an of yeildNodes(g)) 
        {
            if (an instanceof Sequencer) 
            {
                an.scheduleNotes(tempo)
            }
        }
    })

    BufferUtils.initBufferPresets(audioCtx)
    BufferUtils.setRefreshBufferFunc((index : number) => {
        for (const an of yeildNodes(g)) 
        {
            if (an instanceof BufferNode2 && an.bufferKey === index) 
            {
                an.refresh()
            }
        }
    })
}
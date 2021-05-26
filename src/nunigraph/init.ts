






import { NuniGraphRenderer } from './view/graph_renderer.js'
import { NuniGraph } from './model/nunigraph.js'
import { BufferUtils } from '../buffer_utils/internal.js'
import { NuniGraphController, OpenGraphControllers } from './controller/graph_controller.js'

import { KB, audioCtx, MasterClock, NuniGraphAudioNode, OscillatorNode2 } from '../webaudio2/internal.js'
import { snapToGrid } from './view/snap_to_grid.js'
import { WaveformUtils } from '../waveform_utils/mutable_waveform.js'
import { NuniGraphNode } from './model/nunigraph_node.js'




class NuniGraphWrapper extends NuniGraphController {
    volumeNode : GainNode

    constructor(canvas : HTMLCanvasElement, volumeNode : GainNode) {
        const G = new NuniGraph()

        super
            ( G 
            , D('connection-type-prompt')
            , new NuniGraphRenderer(G, canvas))
        
        G.nodes
            .find(({ type }) => type === NodeTypes.OUTPUT)!
            .audioNode
            .connect(volumeNode)

        this.volumeNode = volumeNode
    }
}

NuniGraphAudioNode.createController =
    (canvas : HTMLCanvasElement, volumeNode : GainNode) => 
        new NuniGraphWrapper(canvas, volumeNode)

export const GraphController 
    = new NuniGraphWrapper(D('nunigraph-canvas') as HTMLCanvasElement, audioCtx.volume)

GraphController.activateEventHandlers()
GraphController.g.masterGain.setValueOfParam('gain', 0.125)

OpenGraphControllers.list.push(GraphController)

snapToGrid.attach(() => OpenGraphControllers.render())




if (DEV_MODE_EQUALS_TRUE) 
{
    (<any>window).controller = GraphController
}

Graph_Attachments: {
    // break Graph_Attachments // <- comment this in for testing

    const g = GraphController.g
    
    if (DEV_MODE_EQUALS_TRUE) 
    {
        (<any>window).getAudioNodes = () => [...yieldNodes(g)]
    }

    const yieldBufferNodes = yieldNodesFiltered(ReactsToBufferChange)

    BufferUtils.initBufferPresets(audioCtx)
    BufferUtils.setRefreshBufferFunc((index : number) => {
        for (const { audioNode: an } of yieldBufferNodes(g)) 
        {
            an.refreshBuffer(index)
        }
    })

    WaveformUtils.onWaveformChange(() => {
        for (const { audioNode: an } of yieldNodes(g))
        {
            if (an instanceof OscillatorNode2 && an.type === 'custom')
            {
                an.setPeriodicWave(WaveformUtils.createPeriodicWave)
            }
        }
    })

    function* yieldNodes(g : NuniGraph) : Generator<NuniGraphNode> {
        for (const node of g.nodes) 
        {
            if (node.isOfType(NodeTypes.MODULE))
            {
                yield* yieldNodes(node.audioNode.controller.g)
            } 
            else 
            {
                yield node
            }
        }
    }

    function yieldNodesFiltered <T extends NodeTypes> (whatever : Record<T, boolean>) {
             
        return function* yieldThem(g : NuniGraph) : Generator<NuniGraphNode<T>> {

            for (const node of g.nodes) 
            {
                if (node.isOfType(NodeTypes.MODULE))
                {
                    yield* yieldThem(node.audioNode.controller.g)
                } 
                else if (node.is(whatever))
                {
                    yield node
                }
            }
        }
    }
}
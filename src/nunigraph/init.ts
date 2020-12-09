






import { NuniGraphRenderer } from './view/graph_renderer.js'
import { NuniGraph } from './model/nunigraph.js'
import { BufferUtils } from '../buffer_utils/internal.js'
import { NuniGraphController, ActiveControllers } from './controller/graph_controller.js'

import 
    { KB, audioCtx, Sequencer, BufferNode2
    , MasterClock, NuniSourceNode, NuniGraphAudioNode, PianoRoll12Tone, OscillatorNode2, AutomationNode
    } from '../webaudio2/internal.js'
import { snapToGrid } from './view/snap_to_grid.js'
import { WaveformUtils } from '../waveform_utils/mutable_waveform.js'
import { NuniGraphNode } from './model/nunigraph_node.js'

    
    
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
GraphController.g.masterGain.setValueOfParam('gain', 0.125)

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

    function* yieldNodes(g : NuniGraph) : Generator<NuniGraphNode> {
        for (const node of g.nodes) 
        {
            if (node.type === NodeTypes.MODULE)
            {
                yield* yieldNodes(node.audioNode.controller.g)
            } 
            else 
            {
                yield node
            }
        }
    }
    if (DEBUG) 
    {
        (<any>window).getAudioNodes = () => [...yieldNodes(g)]
    }
    
    KB.attachToGraph(function*() {
        for (const { audioNode: an } of yieldNodes(g)) 
        {
            if (an instanceof NuniSourceNode) 
            { // && an.kbMode !== 'none') {
                yield an
            }
        }
    })
    
    MasterClock.setSchedule(() => {
        for (const { audioNode: an, type } of yieldNodes(g))
        {
            if (IsClockDependent[type]) 
            {
                an.scheduleNotes()
            }
        }
    },
    {  
        setTempo: (tempo : number) => {
            for (const { audioNode: an, type } of yieldNodes(g))
            {
                if (IsClockDependent[type]) 
                {
                    an.setTempo(tempo)
                }
            }
        },
        sync() {
            for (const { audioNode: an, type } of yieldNodes(g))
            {
                if (IsClockDependent[type] && an.isPlaying) 
                {
                    an.sync()
                }
            }
        }
    })

    BufferUtils.initBufferPresets(audioCtx)
    BufferUtils.setRefreshBufferFunc((index : number) => {
        for (const { audioNode: an } of yieldNodes(g)) 
        {
            if (an instanceof BufferNode2 && an.bufferKey === index) 
            {
                an.refresh()
            }
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
}
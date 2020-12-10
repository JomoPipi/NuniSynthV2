






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

    
const is
    = <T extends NodeTypes>(node : NuniGraphNode, type : T)
    : node is NuniGraphNode<T> => node.type === type
    
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
    
    if (DEBUG) 
    {
        (<any>window).getAudioNodes = () => [...yieldNodes(g)]
    }

    //? Useful //?
    // const Keyboardable = { [NodeTypes.OSC]:1, [NodeTypes.SAMPLE]:1 } as const
    // type Keyboardable = keyof typeof Keyboardable
    // const isKeyboardable = (node : NuniGraphNode) : node is NuniGraphNode<Keyboardable> =>
    //     node.type in Keyboardable
    KB.attachToGraph(function*() {
        for (const { audioNode: an } of yieldNodes(g)) 
        {
            if (an instanceof NuniSourceNode) 
            { // && an.kbMode !== 'none') {
                yield an
            }
        }
    })

    const isClockDependent = 
        (node : NuniGraphNode) : node is NuniGraphNode<ClockDependent> => 
            node.type in ClockDependent
    
    const yieldClockedNodes = yieldNodesFiltered(isClockDependent)
    MasterClock.setSchedule(
    {
        scheduleNotes: () => {
            for (const node of yieldClockedNodes(g))
            {
                node.audioNode.scheduleNotes()
            }
        },
        setTempo: (tempo : number) => {
            for (const node of yieldClockedNodes(g))
            {
                node.audioNode.setTempo(tempo)
            }
        },
        sync() {
            for (const { audioNode: an } of yieldClockedNodes(g))
            {
                if (an.isPlaying) an.sync()
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

    function* yieldNodes(g : NuniGraph) : Generator<NuniGraphNode> {
        for (const node of g.nodes) 
        {
            if (is(node, NodeTypes.MODULE))
            {
                yield* yieldNodes(node.audioNode.controller.g)
            } 
            else 
            {
                yield node
            }
        }
    }

    function yieldNodesFiltered <T extends NodeTypes>
        (isWhatever : (node : NuniGraphNode) => node is NuniGraphNode<T>) {
             
        return function* yieldThem(g : NuniGraph) : Generator<NuniGraphNode<T>> {

            for (const node of g.nodes) 
            {
                if (is(node, NodeTypes.MODULE))
                {
                    yield* yieldThem(node.audioNode.controller.g)
                } 
                else if (isWhatever(node))
                {
                    yield node
                }
            }
        }
    }
}







import { NuniGraphRenderer } from './view/graph_renderer.js'
import { NuniGraph } from './model/nunigraph.js'
import KB from '../webaudio2/note_in/keyboard.js'
import MasterClock from '../webaudio2/sequencers/master-clock.js'
import { BufferUtils } from '../buffer_utils/internal.js'
import { audioCtx } from '../webaudio2/webaudio2.js'
import { NuniGraphController } from './controller/graph_controller.js'
import { NuniSourceNode } from '../webaudio2/note_in/nuni_source_node.js'
import { BufferNode2 } from '../webaudio2/note_in/buffer2.js'
import SubgraphSequencer from '../webaudio2/sequencers/subgraph-sequencer.js'
import createValuesWindow from './view/display_nodedata.js'

export const G = new NuniGraph()


KB.attachToGraph(function*() {
    for (const { audioNode: an } of G.nodes) {
        if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
            yield an
        }
    }
})

MasterClock.setSchedule((tempo : number) => {
    for (const { audioNode: an } of G.nodes) {
        if (an instanceof SubgraphSequencer) {
            an.scheduleNotes(tempo)
        }
    }
})

BufferUtils.initBufferPresets(audioCtx)
BufferUtils.setRefreshBufferFunc((index : number) => {
    for (const { audioNode: an } of G.nodes) {
        if (an instanceof BufferNode2 && an.bufferKey === index) {
            an.refresh()
        }
    }
})


export const GraphController = new NuniGraphController(
    G, 
    D('connection-type-prompt')!,
    new NuniGraphRenderer(
        G, 
        D('nunigraph-canvas') as HTMLCanvasElement,
        D('snap-to-grid-btn') as HTMLButtonElement,
        ),
    createValuesWindow
    )
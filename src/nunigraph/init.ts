






import { NuniGraphRenderer } from './view/graph_renderer.js'
import { NuniGraph } from './model/nunigraph.js'
import KB from '../webaudio2/note_in/keyboard.js'
import MasterClock from '../webaudio2/sequencers/master_clock.js'
import { BufferUtils } from '../buffer_utils/internal.js'
import { audioCtx } from '../webaudio2/webaudio2.js'
import { NuniGraphController } from './controller/graph_controller.js'
import { NuniSourceNode } from '../webaudio2/note_in/nuni_source_node.js'
import { BufferNode2 } from '../webaudio2/note_in/buffer2.js'
import createValuesWindow from './view/display_nodedata.js'
import Sequencer from '../webaudio2/sequencers/sequencer.js'
import NuniGraphAudioNode from '../webaudio2/nunigraph_audionode.js'




function createGraphController(canvas : HTMLCanvasElement) {
    const G = new NuniGraph()

    KB.attachToGraph(function*() {
        for (const { audioNode: an } of G.nodes) {
            if (an instanceof NuniSourceNode) { // && an.kbMode !== 'none') {
                yield an
            }
        }
    })

    MasterClock.setSchedule((tempo : number) => {
        for (const { audioNode: an } of G.nodes) {
            if (an instanceof Sequencer) {
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


    const controller = new NuniGraphController(
        G, 
        D('connection-type-prompt')!,
        new NuniGraphRenderer(
            G, 
            canvas,
            D('snap-to-grid-btn') as HTMLButtonElement,
            ),
        createValuesWindow
        )

    return controller
}

NuniGraphAudioNode.createController = createGraphController

const GraphController 
    = createGraphController(
    D('nunigraph-canvas') as HTMLCanvasElement)

export default GraphController
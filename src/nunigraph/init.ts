






import { NuniGraphRenderer } from './graph_renderer.js'
import { NuniGraph } from './nunigraph.js'
import { NuniGraphController } from './graph_controller.js'
import { BufferController } from '../buffer_utils/init_buffers.js'
import { KB } from '../webaudio2/note_in/keyboard.js'
import MasterClock from '../webaudio2/sequencers/master-clock.js'

export const G = new NuniGraph()

KB.attachToGraph(G)
MasterClock.attachToGraph(G)

export const bufferController = new BufferController(G)

export const GraphController = new NuniGraphController(
    G, 
    D('connection-type-prompt')!,
    new NuniGraphRenderer(
        G, 
        D('nunigraph-canvas') as HTMLCanvasElement,
        D('snap-to-grid-btn') as HTMLButtonElement
        )
    )
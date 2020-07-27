import { NuniGraphRenderer } from './view/graph_renderer.js';
import { NuniGraph } from './model/nunigraph.js';
import { BufferUtils } from '../buffer_utils/internal.js';
import { NuniGraphController, ActiveControllers } from './controller/graph_controller.js';
import { createValuesWindow } from './view/display_nodedata.js';
import { KB, audioCtx, Sequencer, BufferNode2, MasterClock, NuniSourceNode, NuniGraphAudioNode } from '../webaudio2/internal.js';
class Nuni extends NuniGraphController {
    constructor(canvas, volumeNode) {
        const G = new NuniGraph();
        super(G, D('connection-type-prompt'), new NuniGraphRenderer(G, canvas), createValuesWindow);
        G.nodes
            .find(({ id }) => id === 0)
            .audioNode
            .connect(volumeNode);
        this.volumeNode = volumeNode;
    }
}
NuniGraphAudioNode.createController =
    (canvas, volumeNode) => new Nuni(canvas, volumeNode);
export const GraphController = new Nuni(D('nunigraph-canvas'), audioCtx.volume);
GraphController.activateEventHandlers();
GraphController.g.nodes[0].setValueOfParam('gain', 0.125);
ActiveControllers.push(GraphController);
let DEBUG = false;
if (DEBUG) {
    window.controller = GraphController;
}
Graph_Attachments: {
    const g = GraphController.g;
    function* yeildNodes(g) {
        for (const { audioNode: an } of g.nodes) {
            if (an instanceof NuniGraphAudioNode) {
                yield* yeildNodes(an.controller.g);
            }
            else {
                yield an;
            }
        }
    }
    KB.attachToGraph(function* () {
        for (const an of yeildNodes(g)) {
            if (an instanceof NuniSourceNode) {
                yield an;
            }
        }
    });
    MasterClock.setSchedule((tempo) => {
        for (const an of yeildNodes(g)) {
            if (an instanceof Sequencer) {
                an.scheduleNotes(tempo);
            }
        }
    });
    BufferUtils.initBufferPresets(audioCtx);
    BufferUtils.setRefreshBufferFunc((index) => {
        for (const an of yeildNodes(g)) {
            if (an instanceof BufferNode2 && an.bufferKey === index) {
                an.refresh();
            }
        }
    });
}
//# sourceMappingURL=init.js.map
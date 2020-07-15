import { renderVisualiserCanvas } from './visualizer.js';
const canvas = D('analyser-canvas');
export function graphVisualEqualizer(analyser) {
    renderVisualiserCanvas(canvas, analyser)();
}
//# sourceMappingURL=global_visualizer.js.map
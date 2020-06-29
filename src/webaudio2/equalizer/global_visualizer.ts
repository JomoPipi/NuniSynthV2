






import { renderVisualiserCanvas } from './visualizer.js'

const canvas = D('analyser-canvas')! as HTMLCanvasElement

export  function graphVisualEqualizer(analyser : AnalyserNode) {
    renderVisualiserCanvas(canvas, analyser)()
}
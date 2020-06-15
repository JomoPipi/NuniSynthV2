






import renderVisualiserCanvas from './visualizer.js'

const canvas = D('analyser-canvas')! as HTMLCanvasElement

export default function graphVisualEqualizer(analyser : AnalyserNode) {
    renderVisualiserCanvas(canvas, analyser)()
}
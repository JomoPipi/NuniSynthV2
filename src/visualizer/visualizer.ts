






import { createRadioButtonGroup } from "../UI_library/internal.js"

const FREQ = 'Freq'
const TIME = 'Time'
let mode = TIME

D('time-freq-toggle')
    .appendChild(createRadioButtonGroup(
    { buttons: [FREQ, TIME]
    , selected: mode
    , className: 'neumorph2'
    , onclick: data => mode = data
    }))

export function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {
    analyser.fftSize = 2048
    analyser.minDecibels = -90
    
    const bufferLength = analyser.frequencyBinCount
    const worker = new Worker('dist/visualizer/visualizer_worker.js', { type: 'module' })

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const offscreen = canvas.transferControlToOffscreen()

    worker.postMessage({ canvas: offscreen, bufferLength }, [offscreen])

    return function render() {
        const fbc_array = new Uint8Array(bufferLength)
        
        if (mode === TIME)
        {
            analyser.getByteTimeDomainData(fbc_array)
            worker.postMessage({ buffer2: fbc_array.buffer })
        }
        else if (mode === FREQ)
        {
            analyser.getByteFrequencyData(fbc_array)
            worker.postMessage({ buffer: fbc_array.buffer })
        }

        requestAnimationFrame(render)
    }
}
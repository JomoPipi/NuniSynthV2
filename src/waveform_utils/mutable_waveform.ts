






import { XYPad } from '../UI_library/components/xypad.js'
import { audioCtx } from '../webaudio2/internal.js'


const slider = D('n-waveform-slider') as HTMLInputElement
const container = D('waveform-test')
const pads = [new XYPad(E('canvas'), 100)]

;(slider.oninput = drawPads)()

function drawPads() {
    container.innerHTML = ''
    pads.length = 0
    for (let i = 0; i < +slider.value; i++)
    {
        const canvas = E('canvas')
        pads.push(new XYPad(canvas, 100))
        container.appendChild(canvas)
    }
}

container.onclick = function(e : MouseEvent) {
    if (e.target instanceof HTMLCanvasElement) 
    {
        newWaveform()
    }
}

export const waveform = { wave: 'sine' as PeriodicWave }
function newWaveform() {

    const n = pads.length
    const real = new Float32Array(n)
    const imag = new Float32Array(n)
    const { H, W } = pads[0]

    for (let i = 0; i < n; i++)
    {
        const [x,y] = pads[i].point
        const X = 2*x/W - 1
        const Y = 2*y/H - 1
        real[i] = X
        imag[i] = Y
    }
    
    waveform.wave = audioCtx.createPeriodicWave(real, imag)
}


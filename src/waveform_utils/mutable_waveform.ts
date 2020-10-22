






import { XYPad } from '../UI_library/components/xypad.js'


const slider = D('n-waveform-slider') as HTMLInputElement
const container = D('waveform-test')
const pads : XYPad[] = []
const callback = { function: (() => void 0) as Function }

;(slider.oninput = () => {
    drawPads()
    callback.function()
})()

function drawPads() {

    container.innerHTML = ''
    pads.length = 0
    for (let i = 1; i < +slider.value+1; i++)
    {
        const pad = new XYPad(100, callback.function)
        pads.push(pad)
        container.appendChild(pad.canvas)
    }

    container.ondblclick = (e : MouseEvent) => {
        const clickedPad = pads.find(pad => pad.canvas === e.target as any)
        if (clickedPad)
        {
            clickedPad.point = [clickedPad.W/2, clickedPad.H/2]
            clickedPad.render()
            callback.function()
        }
    }
}

function createPeriodicWave(ctx : AudioContext) {

    const n = pads.length+1
    const real = new Float32Array(n)
    const imag = new Float32Array(n)
    const { H, W } = pads[0]

    for (let i = 1; i < n; i++)
    {
        const [x,y] = pads[i-1].point
        const X = 2*x/W - 1
        const Y = 2*y/H - 1
        real[i] = X ** 3
        imag[i] = Y ** 3
    }
    
    return ctx.createPeriodicWave(real, imag)
}

export const WaveformUtils = 
    { onWaveformChange: (f : Function) => callback.function = f
    , createPeriodicWave
    }

// ⎍







import { XYSlider } from '../UI_library/components/xyslider.js'


const slider = D('n-waveform-slider') as HTMLInputElement
const container = D('waveform-test')
slider.oninput = () => {
    container.innerHTML = ''
    for (let i = 0; i < +slider.value; i++)
    {
        const canvas = E('canvas')
        new XYSlider(canvas, 100)
        container.appendChild(canvas)
    }
}

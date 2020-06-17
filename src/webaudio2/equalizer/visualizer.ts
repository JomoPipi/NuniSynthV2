








export default function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {

    analyser.fftSize = 4096
    analyser.minDecibels = -90
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight
    const h2 = H/2
    const bufferLength = analyser.frequencyBinCount

    const map_to_new_range = (value : number, start : number, end : number) =>
        value / 255.0 * (start - end) + end

    const gradient = ctx.createLinearGradient(0, 0, W, 0)
    '#C88,#AA8,#898,#9AB,#A8F,#EBE'.split(',').forEach((color,i,arr) =>
        gradient.addColorStop(i/(arr.length-1), color))

    return function render() {

        const fbc_array = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(fbc_array);

        ctx.clearRect(0,0,W,H)

        let x = 0, isClipping = false
        ctx.beginPath()
        ctx.moveTo(0,h2)
        for (let i = 1; i < bufferLength; i++) {
            const sliceWidth = W / bufferLength
            const value = fbc_array[i]
            if (value === 255) isClipping = true
            ctx.lineTo(x, map_to_new_range(value, h2 - H / 2, h2))
            x += sliceWidth * (250/i)
        }
        ctx.strokeStyle = isClipping ? 'red' : gradient
        ctx.stroke()

        requestAnimationFrame(render)
    }
}
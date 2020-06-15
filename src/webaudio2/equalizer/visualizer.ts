








export default function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {

    analyser.fftSize = 256
    analyser.minDecibels = -90
    const ctx = canvas.getContext('2d')!
    const W = canvas.offsetWidth
    const bars = analyser.frequencyBinCount
    const width = W / bars
    const gap = 1
    const color = '#00CCFF'

    return function render() {

        const fbc_array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(fbc_array);
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = color
        for (let i = 0; i < bars; i++) {
            const bar_x = i * width
            const bar_width = width - gap
            const bar_height = -(fbc_array[i] / 2)
            if (bar_height < -127) {
                ctx.fillStyle = 'red'
                ctx.fillRect(bar_x, canvas.height + bar_height, bar_width, -5)
                ctx.fillStyle = '#00CCFF'
            }
            
            ctx.fillRect(bar_x, canvas.height, bar_width, bar_height)
        } 
        requestAnimationFrame(render)
    }
    
}D 
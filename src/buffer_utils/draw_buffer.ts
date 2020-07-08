




// function processWork({ canvas, channel } : Indexed) {
//     // do some work

//     const ctx = canvas.getContext('2d')!
//     const H = canvas.height, W = canvas.width

//     if (!channel) channel = []

//     ctx.save()
//     ctx.fillStyle = '#222'
//     ctx.fillRect(0, 0, W, H)
//     ctx.strokeStyle = '#121'
//     ctx.globalCompositeOperation = 'lighter'
//     ctx.translate(0, H / 2)
//     ctx.globalAlpha = 0.06

//     for (let i = 0; i < channel.length; i++) {
//         const x = W * i / channel.length | 0
//         const y = channel[i] * H / 2
//         ctx.beginPath()
//         ctx.moveTo(x, 0)
//         ctx.lineTo(x + 1, y)
//         ctx.stroke()
//     }
//     ctx.restore()
// }

// function workerFunc() {

//     console.log('executed the workerFunc')

//     onmessage = (e : Event) => {
//         ;(<any>postMessage)('e =',e)
//         console.log('e =',e)
//     }

//     setInterval(function() {
        
//       // TypeScript's intellisense forces me to pass in another argument
//       ;(<any>postMessage)('hello')
//     }, 1000);
// }

// const code = `
//     console.log('executed the workerFunc');
//     onmessage = (e) => {
//         ;
//         postMessage('e =' + e);
//         console.log('e =', e);
//     };
//     setInterval(function () {
//         ;
//         postMessage('hello');
//     }, 1000);
// `

let worker : Worker, firstTime = true

export function drawBuffer(buff : AudioBuffer, canvas : OffscreenCanvas) {
    
    if (firstTime) {
        firstTime = false
        worker = new Worker('/src/buffer_utils/draw_buffer_worker.js')
        worker.postMessage({ canvas }, [canvas])
    }

    worker.postMessage({ buffer: buff.getChannelData(0) })

    // worker.terminate()
}


// let firstTimeDraw = true

// export function drawBuffer(buff : AudioBuffer, canvas : HTMLCanvasElement) {

//     if (!firstTimeDraw) {
        
//     }
//     firstTimeDraw = false
    
//     const ctx = canvas.getContext('2d')!
//     const H = canvas.height, W = canvas.width
//     const channel = buff.getChannelData(0)

//     ctx.save()
//     ctx.fillStyle = '#222'
//     ctx.fillRect(0, 0, W, H)
//     ctx.strokeStyle = '#121'
//     ctx.globalCompositeOperation = 'lighter'
//     ctx.translate(0, H / 2)
//     ctx.globalAlpha = 0.06
    
//     for (let i = 0; i < channel.length; i++) {
//         const x = W * i / channel.length | 0
//         const y = channel[i] * H / 2
//         ctx.beginPath()
//         ctx.moveTo(x, 0)
//         ctx.lineTo(x + 1, y)
//         ctx.stroke()
//     }
//     ctx.restore()
// }





// export function drawBuffer(buff : AudioBuffer, canvas : HTMLCanvasElement) {
    
//     const ctx = canvas.getContext('2d')!
//     const H = canvas.height, W = canvas.width
//     const channel = buff.getChannelData(0)

//     ctx.save()
//     ctx.fillStyle = '#222'
//     ctx.fillRect(0, 0, W, H)
//     ctx.strokeStyle = '#121'
//     ctx.globalCompositeOperation = 'lighter'
//     ctx.translate(0, H / 2)
//     ctx.globalAlpha = 0.06
//     ctx.beginPath()

//     for (let i = 0; i < channel.length; i++) {
//         const x = W * i / channel.length | 0
//         const y = channel[i] * H / 2
//         ctx.moveTo(x, 0)
//         ctx.lineTo(x + 1, y)
//     }

//     ctx.stroke()
//     ctx.restore()
// }






// export function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {
//     analyser.fftSize = 2048
//     analyser.minDecibels = -90
    
//     const bufferLength = analyser.frequencyBinCount
//     const worker = new Worker('/src/visualizer/visualizer_worker.js')

//     canvas.width = canvas.offsetWidth
//     canvas.height = canvas.offsetHeight

//     const offscreen = canvas.transferControlToOffscreen()

//     worker.postMessage({ canvas: offscreen, bufferLength }, [offscreen])

//     return function render() {

//         const fbc_array = new Uint8Array(bufferLength)
//         analyser.getByteFrequencyData(fbc_array)

//         worker.postMessage({ buffer: fbc_array.buffer })

//         requestAnimationFrame(render)
//     }
// }


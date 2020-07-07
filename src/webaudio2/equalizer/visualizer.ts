






const fftSize = 2048

const code = `
    console.log('executed the workerFunc');

    const map_to_new_range = (value, start, end) =>
        value / 255.0 * (start - end) + end

    const bufferLength = ${fftSize}

    const widthConstant = 270 * ${fftSize / 2048.0} | 0

    let ctx, W, H, h2, gradient;

    onmessage = (e) => {
        postMessage('data =' + e.data)

        if (e.data.canvas) {
            W = e.data.canvas.width
            H = e.data.canvas.height
            h2 = H/2
            console.log('got canvas')
            
            ctx = e.data.canvas.getContext('2d')

            gradient = ctx.createLinearGradient(0, 0, W, 0)
                '#C88,#AA8,#898,#9AB,#A8F,#EBE'.split(',').forEach((color,i,arr) =>
                gradient.addColorStop(i/(arr.length-1), color))
        }

        if (e.data.buffer) {
            ctx.clearRect(0,0,W,H)
            const fbc_array = new Uint8Array(e.data.buffer)

            let x = 0, isClipping = false
            ctx.beginPath()
            ctx.moveTo(0,h2)
            for (let i = 1; i < bufferLength; i++) {
                const sliceWidth = W / bufferLength
                const value = fbc_array[i]
                if (value === 255) isClipping = true
                ctx.lineTo(x, map_to_new_range(value, h2 - H / 2, h2))
                x += sliceWidth * (widthConstant/i)
            }
            ctx.strokeStyle = isClipping ? 'red' : gradient
            ctx.stroke()
        }
    }
`

export function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {
    analyser.fftSize = fftSize
    analyser.minDecibels = -90
    
    const blob = new Blob([code], {type: "application/javascript"});
    const worker = new Worker(URL.createObjectURL(blob))

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const bufferLength = analyser.frequencyBinCount
    
    const offscreen = canvas.transferControlToOffscreen()

    worker.postMessage({ canvas: offscreen }, [offscreen])

    return function render() {

        const fbc_array = new Uint8Array(bufferLength)
        analyser.getByteFrequencyData(fbc_array)

        worker.postMessage({ buffer: fbc_array.buffer })

        requestAnimationFrame(render)
    }
}





































































// export function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {

//     analyser.fftSize = fftSize
//     analyser.minDecibels = -90
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width = canvas.offsetWidth
//     const H = canvas.height = canvas.offsetHeight
//     const h2 = H/2
//     const bufferLength = analyser.frequencyBinCount

//     const map_to_new_range = (value : number, start : number, end : number) =>
//         value / 255.0 * (start - end) + end

//     const gradient = ctx.createLinearGradient(0, 0, W, 0)
//     '#C88,#AA8,#898,#9AB,#A8F,#EBE'.split(',').forEach((color,i,arr) =>
//         gradient.addColorStop(i/(arr.length-1), color))

//     // const markedFrequencies = (function go([first,...rest] : number[]) : number[] {
//     //     return first * 4 > 24000 ? [first, ...rest] : go([first*4, first, ...rest])
//     //     })([30])

//     return function render() {

//         const fbc_array = new Uint8Array(bufferLength);
//         analyser.getByteFrequencyData(fbc_array);

//         ctx.clearRect(0,0,W,H)

//         let x = 0, isClipping = false
//         ctx.beginPath()
//         ctx.moveTo(0,h2)
//         for (let i = 1; i < bufferLength; i++) {
//             const sliceWidth = W / bufferLength
//             const value = fbc_array[i]
//             if (value === 255) isClipping = true
//             ctx.lineTo(x, map_to_new_range(value, h2 - H / 2, h2))
//             x += sliceWidth * (250/i)
//         }
//         ctx.strokeStyle = isClipping ? 'red' : gradient
//         ctx.stroke()

//         requestAnimationFrame(render)
//     }
// }






// export  function renderVisualiserCanvas(canvas : HTMLCanvasElement, analyser : AnalyserNode) {

//     analyser.fftSize = 2048
//     const bufferLength = analyser.fftSize
//     const ctx = canvas.getContext('2d')!
//     const W = canvas.width = canvas.offsetWidth
//     const H = canvas.height = canvas.offsetHeight

//     const gradient = ctx.createLinearGradient(0, 0, 0, H)
//     'purple,white,purple'.split(',').forEach((color,i,arr) =>
//         gradient.addColorStop(i/(arr.length-1), color))

//     return function render() {

//         const dataArray = new Uint8Array(bufferLength)
//         analyser.getByteTimeDomainData(dataArray)

//             ctx.fillStyle = 'rgb(200, 200, 200)'
//             ctx.clearRect(0, 0, W, H)
        
//             ctx.strokeStyle = gradient
        
//             const sliceWidth = W * 1.0 / bufferLength
//             let x = 0, max = -Infinity
        
//             ctx.beginPath()
//             for(var i = 0; i < bufferLength; i++) {
//                 const v = dataArray[i]/128.0
//                 const y = v * H/2

//                 if(i === 0)
//                     ctx.moveTo(x, y)
//                 else
//                     ctx.lineTo(x, y)
            
//                 x += sliceWidth
//                 max = Math.max(max, dataArray[i])
//             }
//             if (max === 255) ctx.strokeStyle = 'red'
        
//             ctx.lineTo(W, H/2)
//             ctx.stroke()
        
//         requestAnimationFrame(render)
//     }
// }
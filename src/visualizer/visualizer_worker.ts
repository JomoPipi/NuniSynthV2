






// 'visualizer_worker.js'

export {}

const map_to_new_range = (value : number, start : number, end : number) =>
    value / 255.0 * (start - end) + end

const widthConstant = 138
const rainbow = '#C88,#AA8,#898,#9AB,#A8F,#EBE'.split(',')

let [ctx, W, H, h2, gradient, bufferLength, sliceWidth] = [] as any[]

const init = (e : MessageEvent) => {
    W = e.data.canvas.width
    H = e.data.canvas.height
    bufferLength = e.data.bufferLength
    sliceWidth = W / bufferLength
    h2 = H/2
    ctx = e.data.canvas.getContext('2d')!
    gradient = ctx.createLinearGradient(0, 0, W, 0)
        rainbow.forEach((color,i,arr) =>
        gradient.addColorStop(i/(arr.length-1), color))
}

onmessage = (e : MessageEvent) => 
{
    if (e.data.canvas) 
    {
        init(e)
    }
    else if (e.data.buffer) 
    {
        drawFrequencySpectrum(e)
    }
    else if (e.data.buffer2)
    {
        drawTimeDomain(e)
    }
}

function drawTimeDomain(e : MessageEvent) {
    const buffer2 = e.data.buffer2
    const dataArray = new Uint8Array(buffer2)

    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = gradient

    const sliceWidth = W * 1.0 / bufferLength
    let x = 0, max = -Infinity
    const Y = 0

    ctx.beginPath()
    for(var i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = v * H/2 + Y

        if(i === 0)
        {
            ctx.moveTo(x, y)
        }
        else
        {
            ctx.lineTo(x, y)
        }
    
        x += sliceWidth
        max = Math.max(max, dataArray[i])
    }
    if (max === 255) ctx.strokeStyle = 'red'

    ctx.lineTo(W, H/2)
    ctx.stroke()
}

function drawFrequencySpectrum(e : MessageEvent) {
    // if (e.data.buffer2) drawTimeDomain(e)
    
    const fbc_array = new Uint8Array(e.data.buffer)

    let x = 0, isClipping = false

    ctx.clearRect(0,0,W,H)
    ctx.beginPath()
    ctx.moveTo(0,h2)

    for (let i = 1; i < bufferLength; i++) 
    {
        if (fbc_array[i] === 255) isClipping = true
        ctx.lineTo(x, map_to_new_range(fbc_array[i], 0, h2))
        x += sliceWidth * widthConstant / i
    }
    
    ctx.strokeStyle = isClipping ? 'red' : gradient
    ctx.stroke()
}
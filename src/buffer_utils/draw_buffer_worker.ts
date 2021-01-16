






let [ctx, H, W] = [] as any[]
// const MARGIN = 4

onmessage = function({ data: { canvas, buffer }}) {
    if (canvas) 
    {
        ctx = canvas.getContext('2d')!
        H = canvas.height, 
        W = canvas.width
    }
    else if (buffer) 
    {
        reallyDrawBuffer(buffer, ctx, H, W)
    }
}

const WIDTH_CONSTANT = 300
export function reallyDrawBuffer(channel : Float32Array, ctx : CanvasRenderingContext2D, H : number, W : number) {
    console.log('H,W =',H,W)
    const MARGIN = H < 70 ? 2 : 4
    ctx.save()
    ctx.clearRect(0, 0, W, H)
    // ctx.fillStyle = 'rgba(0,0,0,0)'
    // ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#121'
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(0, H / 2)
    ctx.globalAlpha = 0.06
    ctx.beginPath()
    ctx.lineWidth = 1
    
    let max = -Infinity, min = Infinity

    // This allows the stuff to actually be seen:
    const increment = 1 + (WIDTH_CONSTANT / W) * channel.length / 44100 | 0

    // console.log('increment =',increment)
    for (let i = 0; i < channel.length; i += increment) 
    {
        const x = MARGIN + (W - MARGIN * 2) * i / channel.length | 0
        const y = channel[i] * (H - MARGIN * 2) / 2
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 1, y)
        max = Math.max(max, channel[i])
        min = Math.min(min, channel[i])
    }
    
    ctx.stroke()
    ctx.restore()

    const isClipping = min <= -1 || max >= 1
    ctx.strokeStyle = isClipping ? 'cyan' : 'gray'
    ctx.lineWidth = H < 70 ? 1 : 2

    ctx.strokeRect(MARGIN / 2, MARGIN / 2, W - MARGIN, H - MARGIN)

    // if (isClipping)
    // { 
        // This is because of css filter invert(100%) - we want red:
        // ctx.strokeStyle = 'cyan'
        // ctx.strokeRect(MARGIN / 2, MARGIN / 2, W - MARGIN, H - MARGIN)
        // ctx.strokeRect(MARGIN / 2, MARGIN / 2, W - MARGIN, H - MARGIN)
        // ctx.setLineDash([1,0])
    // }
}

const epsilon = 0.03125
export function reallyDrawBuffer2(
    channel : Float32Array, ctx : CanvasRenderingContext2D, H : number, W : number,
    moveStart : number, moveEnd : number  
    ) {
    const MARGIN = H < 70 ? 2 : 4
    ctx.save()
    ctx.clearRect(0, 0, W, H)
    // ctx.fillStyle = 'rgba(0,0,0,0)'
    // ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#121'
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(0, H / 2)
    ctx.globalAlpha = 0.06
    ctx.beginPath()
    ctx.lineWidth = 1
    
    const start = moveStart * channel.length | 0
    const end = moveEnd * channel.length | 0

    // This allows the stuff to actually be seen:
    const increment = (x => x > 1 ? x | 0 : x)(Math.sqrt((end - start) / 4410))

    // console.log('::increment =',increment)
    let max = -Infinity, min = Infinity
    for (let i = start; i < end; i += increment) 
    {
        const x = MARGIN + (W - MARGIN * 2) * (i - start) / (end - start) | 0
        const index = i | 0
        const y = channel[index] * (H - MARGIN * 2) / 2
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 1, y)
        max = Math.max(max, channel[index])
        min = Math.min(min, channel[index])
    }
    
    ctx.stroke()
    ctx.restore()

    const isClipping = min <= -1 || max >= 1
    ctx.strokeStyle = isClipping ? 'cyan' : 'gray'
    ctx.lineWidth = H < 70 ? 1 : 2

    ctx.strokeRect(MARGIN / 2, MARGIN / 2, W - MARGIN, H - MARGIN)
}
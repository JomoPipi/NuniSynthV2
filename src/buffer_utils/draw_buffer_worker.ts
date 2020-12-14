






let [ctx, H, W] = [] as any[]
const MARGIN = 10

onmessage = function({ data: { canvas, buffer }}) {
    if (canvas) 
    {
        ctx = canvas.getContext('2d')
        H = canvas.height, 
        W = canvas.width
    }
    else if (buffer) 
    {
        reallyDrawBuffer(buffer, ctx, H, W)
    }
}

export function reallyDrawBuffer(channel : Float32Array, ctx : CanvasRenderingContext2D, H : number, W : number) {
    ctx.save()
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#121'
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(0, H / 2)
    ctx.globalAlpha = 0.06
    ctx.beginPath()
    ctx.lineWidth = 1
    
    let max = -Infinity, min = Infinity
    for (let i = 0; i < channel.length; i++) 
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

    ctx.strokeStyle = min <= -1 || max >= 1
        ? 'red'
        : 'gray'

    ctx.lineWidth = 2
    ctx.strokeRect(MARGIN / 2, MARGIN / 2, W - MARGIN, H - MARGIN)
}







let [ctx, H, W] = [] as any[]

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

    for (let i = 0; i < channel.length; i++) 
    {
        const x = W * i / channel.length | 0
        const y = channel[i] * H / 2
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 1, y)
    }
    
    ctx.stroke()
    ctx.restore()
}
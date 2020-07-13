






export {}

let [ctx, H, W] = [] as any[]

onmessage = function({ data: { canvas, buffer }}) {
    console.log('i got a message')
    
    if (canvas) {
        ctx = canvas.getContext('2d')
        H = canvas.height, 
        W = canvas.width
        console.log('hw =',H,W)
    }
    else if (buffer) {
        const channel = Float32Array.from(buffer)

        console.log('drawing a buffer. length =',channel.length)
        
        ctx.save()
        ctx.fillStyle = '#222'
        ctx.fillRect(0, 0, W, H)
        ctx.strokeStyle = '#121'
        ctx.globalCompositeOperation = 'lighter'
        ctx.translate(0, H / 2)
        ctx.globalAlpha = 0.06
        ctx.beginPath()

        for (let i = 0; i < channel.length; i++) {
            const x = W * i / channel.length | 0
            const y = channel[i] * H / 2
            ctx.moveTo(x, 0)
            ctx.lineTo(x + 1, y)
        }
        
        ctx.stroke()
        ctx.restore()
    }
}
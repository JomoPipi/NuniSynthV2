






export function drawBuffer(buff : AudioBuffer, canvas : HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!
    const H = canvas.height, W = canvas.width
    const channel = buff.getChannelData(0)
    ctx.save()
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#121'
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(0, H / 2)
    ctx.globalAlpha = 0.06
    for (let i = 0; i < channel.length; i++) {
        const x = W * i / channel.length | 0
        const y = channel[i] * H / 2
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 1, y)
        ctx.stroke()
    }
    ctx.restore()
    console.log('Done rendering buffer')
}







import { doUntilMouseUp } from "../events/until_mouseup.js"








export class XYPad {

    canvas : HTMLCanvasElement
    W : number
    H : number
    ctx : CanvasRenderingContext2D
    point : [number, number]

    constructor (size : number, callback? : Function) {
        this.canvas = E('canvas')
        this.W = this.H = this.canvas.width = this.canvas.height = size
        this.ctx = this.canvas.getContext('2d')!
        this.point = [this.W/2, this.H/2]

        // TODO: move to CSS
        this.canvas.style.margin = '5px'
        this.canvas.style.border = '1px solid var(--color5)'
        this.canvas.style.backgroundColor = 'transparent'
        
        this.render()

        this.canvas.onmousedown = doUntilMouseUp({ mousemove })
        
        const slider = this
        function mousemove(e : MouseEvent) {

            const l = +slider.canvas.offsetLeft
            const t = +slider.canvas.offsetTop
            const margin = 5
            slider.point[0] = 
            clamp(margin, e.clientX - l, slider.W - margin)

            slider.point[1] =
            clamp(margin, e.clientY - t, slider.H - margin)
            slider.render()

            callback && callback()
        }
    }

    render() {
        this.ctx.clearRect(0,0,this.W,this.H)
        this.ctx.strokeStyle = 'red'
        
        this.ctx.beginPath()
        const [x,y] = this.point
        this.ctx.arc(x, y, 5, 0, 7)
        this.ctx.closePath()
        this.ctx.stroke()
        
        const X = x - this.W/2
        const Y = y - this.H/2
        const rot = Math.PI / 16
        
        this.canvas.style.transform = `
        perspective(200px) 
        rotateY(${-rot*X|0}deg)
        rotateX(${rot*Y|0}deg)`
    }
}
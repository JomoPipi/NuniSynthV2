






import { doUntilMouseUp } from "../events/until_mouseup.js"







export class XYPad {

    canvas : HTMLCanvasElement
    W : number
    H : number
    ctx : CanvasRenderingContext2D
    point : [number, number]

    constructor(canvas : HTMLCanvasElement, size : number, callback? : Function) {
        this.W = this.H = canvas.width = canvas.height = size
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')!
        this.point = [this.W/2, this.H/2]

        // TODO: move to CSS
        this.canvas.style.margin = '5px'
        this.canvas.style.border = '1px solid black'
        this.canvas.style.backgroundColor = 'transparent'
        
        this.render()

        canvas.onmousedown = doUntilMouseUp(mousemove)
        
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
        this.ctx.strokeStyle = 'black'
        
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
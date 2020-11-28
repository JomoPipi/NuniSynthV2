






import { doUntilMouseUp } from "../../UI_library/events/until_mouseup.js"
import { createResizeableCanvas, createResizeableWindow } from "../../UI_library/internal.js"
import { VolumeNodeContainer } from "../volumenode_container.js"







type Point = { x : number, y : number }

type TargetData = 
    { type : 'node'
    , index : number
    }
|
    { type : 'line'
    , index : number
    , x : number
    , y : number
    }
|
    { type : 'empty' } 

const MARGIN = 7
const NODE_RADIUS = 2
const LINE_WIDTH = 1

export class AutomationNode extends VolumeNodeContainer {
    ctx : AudioContext
    private canvas : HTMLCanvasElement
    private ctx2d : CanvasRenderingContext2D
    private points : Point[]
    private controllerHTML? : HTMLElement
    private draggingNode = -1

    constructor(ctx : AudioContext) {
        super(ctx)
        this.ctx = ctx
        this.canvas = E('canvas'); this.canvas.style.backgroundColor = '#111'
        this.ctx2d = this.canvas.getContext('2d')!
        this.ctx2d.lineWidth = LINE_WIDTH

        /* 
            Points: 
            Array<[x,y]> 
            where 0 <= x <= 1 
            and 0 <= y <= 1
            and arr[0].x === 0
            and arr[n-1].x === 1
            and arr[i].x < arr[i+1].x + MIN_X_GAP */
        this.points = []
        this.points.push({ x: 0, y: 1 })
        this.points.push({ x: 1, y: 1 })
    }




    getController(ancestor : HTMLElement) {
        if (!this.controllerHTML)
        {
            requestAnimationFrame(this.render.bind(this))
            
            const mousemoveFunc = this.render.bind(this)
            
            // const box = createResizeableWindow(this.canvas, ancestor, mousemoveFunc) // TODO: <- fix that
            const box = createResizeableCanvas({ canvas: this.canvas, mousemoveFunc }, ancestor)
            this.controllerHTML = box

            this.canvas.onmousedown = // e => this.mousedown(e)
                doUntilMouseUp(e => this.mousemove(e), { mousedown: e => this.mousedown(e) })
    
            return this.controllerHTML
        }
        return this.controllerHTML
    }

    addInput(node : Indexed) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : Indexed) {
        node.audioNode.disconnect(this.volumeNode)
    }

    private render() {
        this.ctx2d.strokeStyle =
        this.ctx2d.fillStyle = 'pink'
        const H = this.canvas.offsetHeight
        const W = this.canvas.offsetWidth
        this.ctx2d.clearRect(0, 0, W, H)
        this.drawLines()
        this.drawNodes()
        this.drawStats(W, H)
    }
    
    private drawLines() {
        const { ctx2d } = this
        ctx2d.beginPath()
        ctx2d.moveTo(...this.mapPointToCanvasCoordinate(this.points[0].x, this.points[0].y))
        for (const { x, y } of this.points.slice(1))
        {
            ctx2d.lineTo(...this.mapPointToCanvasCoordinate(x,y))
        }
        ctx2d.stroke()
        ctx2d.closePath()
    }

    private drawNodes() {
        const { ctx2d } = this
        for (const { x, y } of this.points)
        {
            const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
            ctx2d.beginPath()
            ctx2d.arc(X, Y, NODE_RADIUS, 0, TAU)
            ctx2d.closePath()
            ctx2d.stroke()
            ctx2d.fill()
        }
    }

    private drawStats(W : number, H : number) {
        const { ctx2d: c } = this
        c.fillText('1', W - MARGIN, MARGIN)
        c.fillText('0', W - MARGIN, H - MARGIN)
    }




    private mapPointToCanvasCoordinate(x : number, y : number) : [number, number] {
        return (
            [ MARGIN + (this.canvas.offsetWidth - MARGIN * 2) * x
            , MARGIN + (this.canvas.offsetHeight - MARGIN * 2) * (1 - y)
            ])
    }

    private mapCanvasCoordinateToPoint(x : number, y : number) : [number, number] {
        return (
            [ (x - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            , 1 - (y - MARGIN) / (this.canvas.offsetHeight - MARGIN * 2)
            ])
    }




    private mousedown(e : MouseEvent) {
        const [x, y] = [e.offsetX, e.offsetY]
        const msg = this.getCanvasTarget(x,  y)

        if (msg.type === 'line')
        {
            const { x, y } = msg
            for (let i = 0; i < this.points.length; i++)
            {
                if (x <= this.points[i].x)
                {
                    this.points.splice(i, 0, { x, y })
                    this.draggingNode = i
                    this.render()
                    return
                }
            }
        }

        if (msg.type === 'node')
        {
            this.draggingNode = msg.index
            return
        }

        else
        {
            this.draggingNode = -1
        }
    }

    private mousemove(e : MouseEvent) {
        if (this.draggingNode < 0) return

        const { x: X, y: Y } = this.canvas.getBoundingClientRect()
        const mouseX = e.clientX - X
        const mouseY = e.clientY - Y
        const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, mouseY)

        // Erase unordered points with lower index
        for (let i = 0; i < this.draggingNode; i++)
        {
            if (this.points[i].x >= this.points[this.draggingNode].x)
            {
                this.points.splice(i, this.draggingNode - i)
                this.draggingNode = i
                break
            }
        }

        // Erase unordered points with higher index
        for (let i = this.points.length-1; i > this.draggingNode; i--)
        {
            if (this.points[i].x <= this.points[this.draggingNode].x)
            {
                this.points.splice(this.draggingNode+1, i-this.draggingNode)
                break
            }
        }


        const p = this.points[this.draggingNode]
        // Prevent dragging the x coordinates of end nodes
        if (0 < this.draggingNode && this.draggingNode < this.points.length - 1)
        {
            p.x = clamp(0.0, x, 1)
        }
        p.y = clamp(0, y, 1)

        this.render()
    }




    private getCanvasTarget(mouseX : number, mouseY : number) : TargetData {
        const points = this.points.map(({x, y}) => this.mapPointToCanvasCoordinate(x, y))
        const tolerance = 3

        // Check for node touch:
        for (let i = 0; i < points.length; i++)
        {
            const [x, y] = points[i]
            if (distance(x, y, mouseX, mouseY) <= NODE_RADIUS + tolerance)
            {
                return { type: 'node', index: i }
            }
        }

        // Check for line touch
        for (let i = 0; i < points.length-1; i++)
        {
            const [x2, y2] = points[i+1]
            if (mouseX >= x2) continue
            const [x1, y1] = points[i]

            const m = (y1 - y2) / (x1 - x2)
            const b = y1 - m * x1
            const Y = m * mouseX + b
            const X = (mouseY - b) / m

            const distanceToLine = m > 1
                ? Math.abs(X - mouseX)
                : Math.abs(Y - mouseY)
            
            if (distanceToLine <= LINE_WIDTH + tolerance)
            {
                const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, Y)
                return { type: 'line', index: i, x, y }
            }
        }
        
        // Clicked empty area
        return { type: 'empty' }
    }
}







import { doUntilMouseUp } from "../../../UI_library/events/until_mouseup.js"






type Point = { x : number, y : number }

type TargetData = { 
    type : 'point'
    index : number
} | { 
    type : 'line'
    index : number
    x : number
    y : number
} | { 
    type : 'empty'
    mouseX : number
    mouseY : number
} 

const MARGIN = 7
const POINT_RADIUS = 2
const LINE_WIDTH = 1

export class AutomationPointsEditor {
    points : Point[]
    private canvas : HTMLCanvasElement
    private ctx : CanvasRenderingContext2D
    private controllerHTML? : HTMLElement
    private draggingPoint = -1
    private lastMousedownMsg : TargetData = { type: 'empty', mouseX: 0, mouseY: 0 }
    private lastMouse_moveMsg : TargetData = { type: 'empty', mouseX: 0, mouseY: 0 }
    private mouseIsDown = false
    private canvasSelectionRange? : [number, number]
    private selectedPointRange? : [number, number]

    constructor() {
        this.canvas = E('canvas'); this.canvas.style.backgroundColor = '#111'
        this.ctx = this.canvas.getContext('2d')!
        this.ctx.lineWidth = LINE_WIDTH

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




    getController() {
        if (!this.controllerHTML)
        {
            requestAnimationFrame(this.render.bind(this))
            
            this.controllerHTML = this.canvas // box

            this.canvas.onmousedown = // e => this.mousedown(e)
                doUntilMouseUp(e => this.mousemove(e), 
                    { mousedown: e => this.mousedown(e)
                    , mouseup: e => this.mouseup(e)
                    })

            this.canvas.ondblclick = e => {
                const t = this.getCanvasTarget(e.offsetX, e.offsetY)
                if (t.type === 'point')
                {
                    this.points.splice(t.index, 1)
                    this.render()
                }
            }
        }
        return this.controllerHTML
    }

    private render() {
        this.ctx.strokeStyle =
        this.ctx.fillStyle = 'pink'
        const H = this.canvas.offsetHeight
        const W = this.canvas.offsetWidth
        this.ctx.clearRect(0, 0, W, H)
        this.drawLines()
        this.drawPoints()
        this.drawStats(W, H)
        if (this.canvasSelectionRange)
        {
            this.drawSelectionBox(H, ...this.canvasSelectionRange)
        }
    }
    
    private drawLines() {
        const { ctx } = this
        ctx.beginPath()
        ctx.moveTo(...this.mapPointToCanvasCoordinate(this.points[0].x, this.points[0].y))
        for (const { x, y } of this.points.slice(1))
        {
            ctx.lineTo(...this.mapPointToCanvasCoordinate(x,y))
        }
        ctx.stroke()
        ctx.closePath()
    }

    private drawPoints() {
        const { ctx } = this
        const [a, b] = this.selectedPointRange || [-1, -1]
        for (let i = 0; i < this.points.length; i++)
        {
            const { x, y } = this.points[i]
            const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
            ctx.beginPath()
            ctx.arc(X, Y, POINT_RADIUS, 0, TAU)
            ctx.closePath()
            ctx.stroke()
            const selected = a <= i && i <= b
            ctx.fillStyle = selected ? 'cyan' : 'pink'
            ctx.fill()
        }
    }

    private drawStats(W : number, H : number) {
        const { ctx: c } = this
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

    private insertPoint(x : number, y : number) {
        for (let i = 0; i < this.points.length; i++)
        {
            if (x <= this.points[i].x)
            {
                this.points.splice(i, 0, { x, y })
                this.render()
                return i
            }
        }
        throw `invalid point: (${x},${y})`
    }

    private mousedown(e : MouseEvent) {
        const [x, y] = [e.offsetX, e.offsetY]
        const msg = this.lastMousedownMsg = this.getCanvasTarget(x,  y)
        this.canvasSelectionRange = undefined
        this.selectedPointRange = undefined
        this.draggingPoint = -1
        this.mouseIsDown = true
        // this.lastMousedownX = x
        // this.lastMousedownY = y

        if (msg.type === 'line')
        {
            const { x, y } = msg
            const index = this.insertPoint(x, y)
            this.draggingPoint = index
            this.render()
            return
        }
        else if (msg.type === 'point')
        {
            this.draggingPoint = msg.index
            return
        }
        else {}
    }

    private mousemove(e : MouseEvent) {
        const { x, y } = this.canvas.getBoundingClientRect()
        const mouseX = e.clientX - x
        const mouseY = e.clientY - y

        if (this.draggingPoint >= 0) 
        {
            this.dragSelectedPoints(mouseX, mouseY)
        }
        else if (this.mouseIsDown && this.lastMousedownMsg.type === 'empty')
        {
            this.canvasSelectionRange = [this.lastMousedownMsg.mouseX, mouseX]
        }
        else
        {
            return;
        }

        this.render()
    }

    private mouseup(e : MouseEvent) {
        if (this.lastMousedownMsg.type === "empty" && this.canvasSelectionRange)
        {
            this.selectPointsInRange()
        }
        this.canvasSelectionRange = undefined
        this.mouseIsDown = false
        this.render()
    }

    private getCanvasTarget(mouseX : number, mouseY : number) : TargetData {
        const points = this.points.map(({x, y}) => this.mapPointToCanvasCoordinate(x, y))
        const tolerance = 3

        // Check for point touch:
        for (let i = 0; i < points.length; i++)
        {
            const [x, y] = points[i]
            if (distance(x, y, mouseX, mouseY) <= POINT_RADIUS + tolerance)
            {
                return { type: 'point', index: i }
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
        return { type: 'empty', mouseX, mouseY }
    }

    private drawSelectionBox(H : number, startMouseX : number, currentMouseX : number) {
        const [startX, endX]  = 
            [ (startMouseX - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            , (currentMouseX - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            ].sort((a,b) => a - b)
        this.ctx.fillStyle = 'rgba(255,255,0,0.1)'
        this.ctx.fillRect(startMouseX, 0, currentMouseX - startMouseX, H)
    }
    
    private selectPointsInRange() {
        if (!this.canvasSelectionRange) throw 'Misuse of this function'
        const [x1, x2] = this.canvasSelectionRange
        const [startX, endX]  = 
            [ (x1 - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            , (x2 - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            ].sort((a,b) => a - b)

        // insert points at the start and ends of the selection
        ;[startX, endX].forEach((x, i) => {
            const segmentIndex = 
                this.points.slice(0,-1).findIndex((p, i) => p.x < x && x < this.points[i+1].x)
            if (segmentIndex < 0) return

            const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = this.points.slice(segmentIndex)

            const m = (y1 - y2)/(x1 - x2)
            const b = y1 - m * x1
            const y = m * x + b

            this.insertPoint(x, y)
        })

        this.selectedPointRange = [startX, endX]
            .map(x => this.points.findIndex(p => p.x === x)) as [number, number]
    }

    private dragSelectedPoints(mouseX : number, mouseY : number) {
        const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, mouseY)

        // Erase unordered points with lower index
        for (let i = 0; i < this.draggingPoint; i++)
        {
            if (this.points[i].x >= this.points[this.draggingPoint].x)
            {
                this.points.splice(i, this.draggingPoint - i)
                this.draggingPoint = i
                break
            }
        }

        // Erase unordered points with higher index
        for (let i = this.points.length-1; i > this.draggingPoint; i--)
        {
            if (this.points[i].x <= this.points[this.draggingPoint].x)
            {
                this.points.splice(this.draggingPoint+1, i-this.draggingPoint)
                break
            }
        }

        const p = this.points[this.draggingPoint]
        // Prevent dragging the x coordinates of end points
        if (0 < this.draggingPoint && this.draggingPoint < this.points.length - 1)
        {
            p.x = clamp(0.0, x, 1)
        }
        p.y = clamp(0, y, 1)
    }
}

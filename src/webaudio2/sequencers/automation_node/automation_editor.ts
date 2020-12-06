






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
} | {
    type : 'handlebar'
    index : number
}

interface TransformArgs {
    x : number
    y : number
    dx : number
    dy : number
}

const TRANSFORMS : [s : string, f : (v : TransformArgs) => Point][] =
    [ ['green', ({ x, y, dx, dy }) => ({ x: x + dx, y: y + dy })]
    , ['yellow', x => ({ x: 0, y: 0 })]
    , ['red', x => ({ x: 0, y: 0 })]
    ]

const MARGIN = 30
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
    private rangeOfSelectedPoints? : [number, number]

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
        if (this.rangeOfSelectedPoints)
        {
            this.drawTransformHandlebars()
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
        const [a, b] = this.rangeOfSelectedPoints || [1e9,-1]
        for (let i = 0; i < this.points.length; i++)
        {
            const { x, y } = this.points[i]
            const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
            this.drawPoint(X, Y, a <= i && i <= b ? 'cyan' : 'pink')
        }
    }

    private drawPoint(X : number, Y : number, color : string) {
        this.ctx.beginPath()
        this.ctx.arc(X, Y, POINT_RADIUS, 0, TAU)
        this.ctx.closePath()
        this.ctx.stroke()
        this.ctx.fillStyle = color 
        this.ctx.fill()
    }

    private drawStats(W : number, H : number) {
        const { ctx: c } = this
        c.fillText('1', W - MARGIN, MARGIN)
        c.fillText('0', W - MARGIN, H - MARGIN)
    }

    private drawSelectionBox(H : number, startMouseX : number, currentMouseX : number) {
        const [startX, endX]  = 
            [ (startMouseX - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            , (currentMouseX - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            ].sort((a,b) => a - b)
        this.ctx.fillStyle = 'rgba(255,255,0,0.1)'
        this.ctx.fillRect(startMouseX, 0, currentMouseX - startMouseX, H)
    }

    private drawTransformHandlebars() {
        for (const [x, y, color] of this.getTransformHandlebars())
        {
            this.drawPoint(...this.mapPointToCanvasCoordinate(x, y), color)
        }
    }

    private getTransformHandlebars() : [number, number, string][] {
        const dy = 0.2
        const xgap = 0.04
        let max = 0
        const [start, end] = this.rangeOfSelectedPoints!
        const { x } = this.points[start]
        const points = []
        for (let i = start; i <= end; i++)
        {
            max = Math.max(max, this.points[i].y)
        }
        for (let i = 0; i < TRANSFORMS.length; i++)
        {
            points.push([x - xgap * i, dy + max, TRANSFORMS[i][0]] as [number,number,string])
        }
        return points
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
        this.draggingPoint = -1
        this.mouseIsDown = true
        // this.lastMousedownX = x
        // this.lastMousedownY = y

        if (msg.type === 'line')
        {
            this.rangeOfSelectedPoints = undefined
            const { x, y } = msg
            const index = this.insertPoint(x, y)
            this.draggingPoint = index
            this.render()
            return
        }
        else if (msg.type === 'point')
        {
            this.rangeOfSelectedPoints = undefined
            this.draggingPoint = msg.index
            return
        }
        else if (msg.type === 'handlebar')
        {
            // msg.index is the transform index
        }
        else
        {
            this.rangeOfSelectedPoints = undefined
        }
    }

    private mousemove(e : MouseEvent) {

        if (this.lastMousedownMsg.type === 'handlebar')
        {
            this.transformSelectedPoints(e, this.lastMousedownMsg.index)
        }
        else if (this.draggingPoint >= 0) 
        {
            const { x, y } = this.canvas.getBoundingClientRect()
            const mouseX = e.clientX - x
            const mouseY = e.clientY - y
            this.dragSelectedPoints(mouseX, mouseY)
        }
        else if (this.mouseIsDown && this.lastMousedownMsg.type === 'empty')
        {
            const { x } = this.canvas.getBoundingClientRect()
            const mouseX = e.clientX - x
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
        const TOLERANCE = 3

        // Check for handlebar touch is points are selected
        if (this.rangeOfSelectedPoints)
        {
            const hb = this.getTransformHandlebars()
            for (let i = 0; i < hb.length; i++)
            {
                const [x, y, color] = hb[i]
                const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
                if (distance(mouseX, mouseY, X, Y) <= POINT_RADIUS + TOLERANCE)
                {
                    return { type: 'handlebar', index: i }
                }
            }
        }

        // Check for point touch:
        for (let i = 0; i < points.length; i++)
        {
            const [x, y] = points[i]
            if (distance(x, y, mouseX, mouseY) <= POINT_RADIUS + TOLERANCE)
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
            
            if (distanceToLine <= LINE_WIDTH + TOLERANCE)
            {
                const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, Y)
                return { type: 'line', index: i, x, y }
            }
        }
        
        // Clicked empty area
        return { type: 'empty', mouseX, mouseY }
    }

    private selectPointsInRange() {
        if (!this.canvasSelectionRange) throw 'Misuse of this function'
        const [x1, x2] = this.canvasSelectionRange
        const [startX, endX]  = 
            [ (x1 - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            , (x2 - MARGIN) / (this.canvas.offsetWidth - MARGIN * 2)
            ]
            .sort((a,b) => a - b)
            .map(x => clamp(0, x, 1))

        // insert points at the start and ends of the selection
        ;[startX, endX].forEach((x, i) => {
            // return; // Comment out to see the difference
            const segmentIndex = 
                this.points.slice(0,-1).findIndex((p, i) => p.x < x && x < this.points[i+1].x)
            if (segmentIndex < 0) return

            const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = this.points.slice(segmentIndex)

            const m = (y1 - y2)/(x1 - x2)
            const b = y1 - m * x1
            const y = m * x + b

            this.insertPoint(x, y)
        })

        this.rangeOfSelectedPoints = [startX, endX]
            .map(x => 
                clamp(1, this.points.findIndex(p => p.x === x), this.points.length-2)
                ) as [number, number]
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

    private transformSelectedPoints({ movementX, movementY } : MouseEvent, index : number) {
        const H = this.canvas.offsetHeight
        const W = this.canvas.offsetWidth
        const dx = movementX / W
        const dy = -movementY / H
        
        const [startIndex, endIndex] = this.rangeOfSelectedPoints!
        const points = this.points.slice(startIndex, endIndex+1)
        const newPoints = 
            points.map(({ x, y }) =>
                TRANSFORMS[index][1]({ x, y, dx, dy }))

        // Don't take selected points out of range
        if (newPoints.some(({ x, y }) => (x < 0 || y < 0 || x > 1 || y > 1) && (log('x, y =',x,y), 1))) return;
        
        const startX = newPoints[0].x
        const endX = newPoints[newPoints.length-1].x
        const leftPoints = this.points.slice(0, startIndex).filter(({ x }) => x < startX)
        const rightPoints = this.points.slice(endIndex + 1).filter(({ x }) => x > endX)

        this.rangeOfSelectedPoints = [leftPoints.length, leftPoints.length + newPoints.length - 1]
        this.points = leftPoints.concat(newPoints).concat(rightPoints)
    }
}
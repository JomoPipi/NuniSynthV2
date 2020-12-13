






import { doUntilMouseUp } from "../../../UI_library/events/until_mouseup.js"






type Point = { x : number, y : number }

type TargetData = ({ 
    type : 'point'
    index : number
} | { 
    type : 'line'
    index : number
    x : number
    y : number
} | { 
    type : 'empty'
} | {
    type : 'handlebar'
    index : number
    snapshotOfPoints : Point[]
    snapshotOfSelectedRange : [number, number]
}) & {
    mouseX : number
    mouseY : number
}

interface TransformArgs {
    dx : number
    dy : number
}

const TRANSFORMS : [s : string, f : (points : Point[], args : TransformArgs) => Point[]][] =
    [ ['green', // Translate x
        (ps, { dx, dy }) => 
            ps.map(({ x, y }) => ({ x: x + dx, y }))
        ]
    , ['cyan', // Translate y
        (ps, { dx, dy }) => 
            ps.map(({ x, y }) => ({ x, y: y + dy }))
        ]
    , ['yellow', // x-axis stretch
        (ps, { dx, dy }) => {
            const minX = ps[0].x
            const maxX = ps[ps.length-1].x
            const midX = (minX + maxX) / 2
            return ps.map(({ x, y }) => ({ x: x + dx * ((x - minX) / (maxX - minX)), y }))
        }]
    , ['red', // y-axis stretch
        (ps, { dx, dy }) => {
            const minY = ps.reduce((a, { y }) => Math.min(a, y), 1)
            const maxY = ps.reduce((a, { y }) => Math.max(a, y), 0)
            const midY = (minY + maxY) / 2
            if (minY === maxY) return ps.map(({ x, y }) => ({ x, y: y + dy })) // Avoid division by 0
            return ps.map(({ x, y }) => ({ x, y: y + dy * ((y - midY - minY) / (maxY - minY)) }))
        }]
    ]

const MARGIN = 15
const POINT_RADIUS = 2
const LINE_WIDTH = 1

// const SELECT_MODE = '👉'
// const FREEHAND_MODE = '✏️'

const SELECT_MODE = 0
const FREEHAND_MODE = 1
const MODES = [0, 1]

export class AutomationPointsEditor {
    points : Point[]
    // private modeEngine : ModeEngine
    private mode : number = SELECT_MODE
    private canvas : HTMLCanvasElement
    private ctx : CanvasRenderingContext2D
    private mouseIsDown = false
    private lastMousedownMsg : TargetData = { type: 'empty', mouseX: 0, mouseY: 0 }
    private controllerHTML? : HTMLElement

    private draggingPoint = -1
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
                if (t.type === 'point' && 0 < t.index && t.index < this.points.length - 1)
                {
                    this.points.splice(t.index, 1)
                    this.render()
                }
            }
        }
        return this.controllerHTML
    }

    setMode(mode : number) {
        this.mode = mode
        this.rangeOfSelectedPoints = undefined
        this.render()
    }




    private render() {
        const H = this.canvas.offsetHeight
        const W = this.canvas.offsetWidth
        this.ctx.clearRect(0, 0, W, H)
        this.ctx.strokeStyle = 'gray'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(MARGIN, MARGIN, W - MARGIN * 2, H - MARGIN * 2)
        this.ctx.strokeStyle =
        this.ctx.fillStyle = 'pink'
        this.ctx.lineWidth = LINE_WIDTH
        this.drawLines()
        this.drawPoints()
        this.drawStats(W, H)

        switch (this.mode) {
            case SELECT_MODE:
                if (this.canvasSelectionRange)
                {
                    this.drawSelectionBox(H, ...this.canvasSelectionRange)
                }
                if (this.rangeOfSelectedPoints)
                {
                    this.drawTransformHandlebars()
                }
                break
            
            case FREEHAND_MODE: 
                break
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
        const [startIndex, endIndex] = this.rangeOfSelectedPoints || [1e9,-1]
        const [selectStart, selectEnd] = (this.canvasSelectionRange || [NaN, NaN]).sort((a,b) => a - b)
        
        for (let i = 0; i < this.points.length; i++)
        {
            const { x, y } = this.points[i]
            const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
            const color = (startIndex <= i && i <= endIndex) || (selectStart <= X && X <= selectEnd)
                ? 'cyan' 
                : 'pink'
            this.drawPoint(X, Y, color)
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
        const x = W - MARGIN * 0.75 | 0
        c.fillText('1', x, MARGIN)
        c.fillText('0', x, H - MARGIN)
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
                if (x === this.points[i].x)
                {
                    this.points[i].y = y
                }
                else
                {
                    this.points.splice(i, 0, { x, y })
                }
                this.render()
                return i
            }
        }
        throw `invalid point: (${x},${y})`
    }
    
    private getCanvasTarget(mouseX : number, mouseY : number) : TargetData {
        const points = this.points.map(({ x, y }) => this.mapPointToCanvasCoordinate(x, y))
        const TOLERANCE = 2

        // Check for handlebar hit if points are selected:
        if (this.rangeOfSelectedPoints)
        {
            const hb = this.getTransformHandlebars()
            for (let i = 0; i < hb.length; i++)
            {
                const [x, y, color] = hb[i]
                const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
                if (distance(mouseX, mouseY, X, Y) <= POINT_RADIUS + TOLERANCE)
                {
                    return (
                        { type: 'handlebar'
                        , index: i
                        , snapshotOfPoints: JSON.parse(JSON.stringify(this.points))
                        , snapshotOfSelectedRange: [...this.rangeOfSelectedPoints]
                        , mouseX
                        , mouseY 
                        })
                }
            }
        }

        // Check for point hit:
        for (let i = 0; i < points.length; i++)
        {
            const [x, y] = points[i]
            if (distance(x, y, mouseX, mouseY) <= POINT_RADIUS + TOLERANCE)
            {
                return { type: 'point', index: i, mouseX, mouseY }
            }
        }

        // Check for line hit:
        for (let i = 0; i < points.length-1; i++)
        {
            const [[x1, y1], [x2, y2]] = points.slice(i)
            if (mouseX < x1 || mouseX > x2) continue
            // Line 1:
            const m1 = (y1 - y2) / (x1 - x2)
            const b1 = y1 - m1 * x1
            // Line 2:
            const m2 = -1 / m1
            const b2 = mouseY - m2 * mouseX
            // Solution:
            const X = (b1 - b2) / (m2 - m1)
            const Y = m1 * X + b1

            const [distanceToLine, _y] = m1 === 0
                ? [Math.abs(mouseY - y1), y1] 
                : [distance(mouseX, mouseY, X, Y), Y]

            if (distanceToLine <= LINE_WIDTH + TOLERANCE)
            {
                const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, _y)
                return { type: 'line', index: i, x, y, mouseX, mouseY }
            }
        }
        
        // Hit empty area:
        return { type: 'empty', mouseX, mouseY }
    }




    //** MouseHandlers
    private mousedown(e : MouseEvent) {
        const [x, y] = [e.offsetX, e.offsetY]
        const msg = this.lastMousedownMsg = this.getCanvasTarget(x,  y)
        this.canvasSelectionRange = undefined
        this.draggingPoint = -1
        this.mouseIsDown = true

        switch (this.mode) {
            case SELECT_MODE: this.SELECT_MODE_mousedown(msg); break
            case FREEHAND_MODE: this.FREEHAND_MODE_mousedown(msg); break
        }
    }

    private mousemove(e : MouseEvent) {
        const { x, y } = this.canvas.getBoundingClientRect()
        const mouseX = e.clientX - x
        const mouseY = e.clientY - y

        switch (this.mode) {
            case SELECT_MODE: this.SELECT_MODE_mousemove(mouseX, mouseY); break
            case FREEHAND_MODE: this.FREEHAND_MODE_mousemove(mouseX, mouseY); break
        }
    }

    private mouseup(e : MouseEvent) {
        switch (this.mode) {
            case SELECT_MODE: this.SELECT_MODE_mouseup(); break
            case FREEHAND_MODE: this.FREEHAND_MODE_mouseup(); break
        }

        this.canvasSelectionRange = undefined
        this.mouseIsDown = false
        this.render()
    }




    //* SELECT MODE STUFF *//
    private SELECT_MODE_mousedown(msg : TargetData) {
        if (msg.type === 'line')
        {
            this.rangeOfSelectedPoints = undefined
            const { x, y } = msg
            const index = this.insertPoint(x, y)
            this.draggingPoint = index
        }
        else if (msg.type === 'point')
        {
            this.rangeOfSelectedPoints = undefined
            this.draggingPoint = msg.index
            return
        }
        else if (msg.type === 'handlebar')
        {
            return
        }
        else if (msg.type === 'empty')
        {
            this.rangeOfSelectedPoints = undefined
        }
        this.render()
    }

    private SELECT_MODE_mousemove(mouseX : number, mouseY : number) {
        if (this.lastMousedownMsg.type === 'handlebar')
        {
            this.transformSelectedPoints(mouseX, mouseY, this.lastMousedownMsg.index)
        }
        else if (this.draggingPoint >= 0) 
        {
            this.dragSinglePoint(mouseX, mouseY)
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

    private SELECT_MODE_mouseup() {
        if (this.lastMousedownMsg.type === "empty" && this.canvasSelectionRange)
        {
            this.selectPointsInRange()
        }
    }

    private drawSelectionBox(H : number, startMouseX : number, currentMouseX : number) {
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
        const dy = 0.1
        const xgap = 0.025
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
            points.push([x + xgap * i, dy + max, TRANSFORMS[i][0]] as [number,number,string])
        }
        return points
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

        //! Insert points at the start and ends of the selection: //!
        // ;[startX, endX].forEach((x, i) => {
        //     // return; // Comment out to see the difference
        //     const segmentIndex = 
        //         this.points.slice(0,-1).findIndex((p, i) => p.x < x && x < this.points[i+1].x)
        //     if (segmentIndex < 0) return

        //     const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = this.points.slice(segmentIndex)

        //     const m = (y1 - y2)/(x1 - x2)
        //     const b = y1 - m * x1
        //     const y = m * x + b

        //     this.insertPoint(x, y)
        // })
        // this.rangeOfSelectedPoints = [startX, endX]
        //     .map(x => 
        //         clamp(1, this.points.findIndex(p => p.x === x), this.points.length-2)
        //         ) as [number, number]

        //! Don't insert points at the start and ends of selection: //!
        this.rangeOfSelectedPoints = 
            [ this.points.findIndex(p => p.x > startX)
            , endX >= 1 
                ? this.points.length-2 
                : this.points.slice(0,-1).findIndex((p,i) => p.x <= endX && endX < this.points[i+1].x)
            ]
            .map(x => clamp(1, x, this.points.length-2)) as [number, number]
        
        // Don't select fewer than 2 points
        if (this.rangeOfSelectedPoints[0] >= this.rangeOfSelectedPoints[1])
        {
            this.rangeOfSelectedPoints = undefined
        }

        //? Which one do we like better //?
    }

    private dragSinglePoint(mouseX : number, mouseY : number) {
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

    private transformSelectedPoints(currentMouseX : number, currentMouseY : number, index : number) {
        
        if (this.lastMousedownMsg.type !== 'handlebar') throw 'Someone is not using this method properly'
        const { mouseX, mouseY, snapshotOfPoints: points, snapshotOfSelectedRange } = this.lastMousedownMsg
        const [x1, y1] = this.mapCanvasCoordinateToPoint(mouseX, mouseY)
        const [x2, y2] = this.mapCanvasCoordinateToPoint(currentMouseX, currentMouseY)
        const dx = x2 - x1
        const dy = y2 - y1
        
        const [startIndex, endIndex] = snapshotOfSelectedRange
        const selectedPoints = points.slice(startIndex, endIndex+1)
        const newPoints = TRANSFORMS[index][1](selectedPoints, { dx, dy })
        
        // Don't take selected points out of range
        if (newPoints.some(({ x, y }) => (x <= 0 || y < 0 || x >= 1 || y > 1))) return;

         // Horizontal stretch can cause this:
        if (newPoints[0].x > newPoints[newPoints.length-1].x) newPoints.reverse()

        const startX = newPoints[0].x
        const endX = newPoints[newPoints.length-1].x
        const leftPoints = [points[0]]
            .concat(points.slice(1, startIndex).filter(({ x }) => x < startX))
            
        const rightPoints = points.slice(endIndex + 1, -1).filter(({ x }) => x > endX)
            .concat([points[points.length-1]])

        this.rangeOfSelectedPoints = [leftPoints.length, leftPoints.length + newPoints.length - 1]
        this.points = leftPoints.concat(newPoints).concat(rightPoints)
    }




    //* FREEHAND MODE STUFF *//

    // Prevents points from being too dense:
    private lastInsertedX = -1

    private FREEHAND_MODE_mousedown(msg : TargetData) {
        const { mouseX, mouseY } = msg
        const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, mouseY)
        this.insertPoint(this.lastInsertedX = clamp(0, x, 1), clamp(0, y, 1))
        this.render()
    }

    private FREEHAND_MODE_iterations = 0
    private FREEHAND_MODE_mousemove(mouseX : number, mouseY : number) {
        const [x, y] = this.mapCanvasCoordinateToPoint(mouseX, mouseY)
        const TICK = 1
        if (this.FREEHAND_MODE_iterations++ % TICK === 0)
        {
            const nextX = clamp(0, x, 1)
            const [a, b] = [this.lastInsertedX, nextX].sort((a, b) => a - b)
            // Remove points we "run" over
            this.points = this.points.filter(({ x }) => x <= a || x >= b)
            // Add a new point
            this.insertPoint(this.lastInsertedX = nextX, clamp(0, y, 1))
        }
        this.render()
    }

    private FREEHAND_MODE_mouseup() {
        // Optimize points:
        // For each three consecutive points
        // if the distance from the middle point 
        // to the line made by the other two
        // differs by less than a certain amount
        // then we delete it
        // repeat the process until no more points need to be deleted
        const optimizePoints = () => {
            const threshold = 0.01
            const toDelete = {} as Record<number, true>
            let goAgain = false
            for (let i = 0; i < this.points.length - 2; i++)
            {
                const [p1, { x, y }, p3] = this.points.slice(i)
                // Line 1:
                const m1 = (p1.y - p3.y) / (p1.x - p3.x)
                const b1 = p1.y - m1 * p1.x
                // Line 2:
                const m2 = -1 / m1
                const b2 = y - m2 * x
                // Solution:
                const X = (b1 - b2) / (m2 - m1)
                const Y = m1 * X + b1

                const distanceToLine = m1 === 0
                    ? Math.abs(y - p1.y) 
                    : distance(x, y, X, Y)
                if (distanceToLine < threshold)
                {
                    toDelete[++i] = goAgain = true
                }
            }
            this.points = this.points.filter((_,i) => !toDelete[i])
            if (goAgain) optimizePoints()
        }
        optimizePoints()
        this.render()
    }
}
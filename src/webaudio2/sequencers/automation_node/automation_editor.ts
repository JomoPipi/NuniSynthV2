






import { doUntilMouseUp } from "../../../UI_library/events/until_mouseup.js"






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

export class AutomationPointsEditor {
    points : Point[]
    private canvas : HTMLCanvasElement
    private ctx : CanvasRenderingContext2D
    private controllerHTML? : HTMLElement
    private draggingNode = -1
    private lastMousedownX = 0
    private lastMousedownY = 0
    private currentSelectionBox? : [number,number,number,number]
    private selectedPoints : Point[] = []

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
                if (t.type === 'node')
                {
                    this.points.splice(t.index, 1)
                    this.render()
                }
            }

    
            return this.controllerHTML
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
        this.drawNodes()
        this.drawStats(W, H)

        if (this.currentSelectionBox)
        {
            this.ctx.strokeStyle = 'yellow'
            this.ctx.setLineDash([5,3])
            this.ctx.strokeRect(...this.currentSelectionBox)
            this.ctx.setLineDash([1,0])
            this.ctx.fillStyle = 'pink'
        }
    }
    
    private drawLines() {
        const { ctx } = this
        ctx.beginPath()
        ctx.moveTo(...this.mapPointToCanvasCoordinate(this.points[0].x, this.points[0].y))
        const sortedPoints = this.points.slice(1).concat(this.selectedPoints).sort((a,b) => a.x - b.x)
        for (const { x, y } of sortedPoints)
        {
            ctx.lineTo(...this.mapPointToCanvasCoordinate(x,y))
        }
        ctx.stroke()
        ctx.closePath()
    }

    private drawNodes() {
        const { ctx } = this
        let [x1,x2,y1,y2] : any = []
        if (this.currentSelectionBox)
        {
            const [x,y,w,h] = this.currentSelectionBox
            const [X,Y] = [x+w, y+h]
            ;[[x1,x2],[y1,y2]] = [[x,X],[y,Y]].map(arr=>arr.sort((a,b) => a - b))
        }
        const sortedPoints = this.points.slice(1).concat(this.selectedPoints).sort((a,b) => a.x - b.x)
        for (const { x, y } of sortedPoints)
        {
            const [X, Y] = this.mapPointToCanvasCoordinate(x, y)
            const selected = x1 <= X && X <= x2 && y1 <= Y && Y <= y2
            ctx.beginPath()
            ctx.arc(X, Y, NODE_RADIUS, 0, TAU)
            ctx.closePath()
            ctx.stroke()
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

    private mousedown(e : MouseEvent) {
        const [x, y] = [e.offsetX, e.offsetY]
        const msg = this.getCanvasTarget(x,  y)
        this.currentSelectionBox = undefined
        this.draggingNode = -1
        this.lastMousedownX = x
        this.lastMousedownY = y

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
        else if (msg.type === 'node')
        {
            this.draggingNode = msg.index
            return
        }
        else
        {
            this.currentSelectionBox = [x, y, 0, 0]
        }
    }

    private mousemove(e : MouseEvent) {
        const { x, y } = this.canvas.getBoundingClientRect()
        const mouseX = e.clientX - x
        const mouseY = e.clientY - y

        if (this.draggingNode >= 0) 
        {
            this.dragSelectedNode(mouseX, mouseY)
        }
        else if (this.currentSelectionBox)
        {
            this.currentSelectionBox = 
                [ this.lastMousedownX
                , this.lastMousedownY
                , mouseX - this.lastMousedownX
                , mouseY - this.lastMousedownY
                ]
        }
        else
        {
            return;
        }

        this.render()
    }

    private mouseup(e : MouseEvent) {
        if (this.currentSelectionBox) this.selectPoints()

        this.currentSelectionBox = undefined
        this.render()
    }

    private selectPoints() {
        const [x,y,w,h] = this.currentSelectionBox!
        const [X,Y] = [x+w, y+h]
        const [[x1,x2],[y1,y2]] = [[x,X],[y,Y]].map(arr=>arr.sort((a,b) => a - b))
        this.selectedPoints = []
        const points : Point[] = []
        for (const point of this.points)
        {
            const { x, y } = point
            const [ X, Y ] = this.mapPointToCanvasCoordinate(x, y)
            const selected = x1 <= X && X <= x2 && y1 <= Y && Y <= y2
            ;(selected ? this.selectedPoints : points).push(point)
        }
        // this.points = points
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

    dragSelectedNode(mouseX : number, mouseY : number) {
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
    }
}

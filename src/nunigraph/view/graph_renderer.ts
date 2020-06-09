






import { NuniGraphNode } from '../model/nunigraph_node.js'
import { NuniGraph } from '../model/nunigraph.js'

export enum HOVER { EDGE, SELECT, CONNECTION, EMPTY }

type GraphRenderOptions = {
    H : number,
    W : number,
    x? : number,
    y? : number,
    buttons? : number,
    hover_type? : HOVER,
    hover_id? : number | string // could be node id or connection id
    selectionStart? : [number,number]
    selectedNodes : NuniGraphNode[]
    }

type ConnectionsCache = {
    [connectionId : string] : { 
        x : number, 
        y : number, 
        fromId : number, 
        toId : number, 
        connectionType : ConnectionType 
        } 
    }

export class NuniGraphRenderer {

    fromNode : NuniGraphNode | null
    private readonly g : NuniGraph
    readonly canvas : HTMLCanvasElement
    private snapToGrid : boolean
    private readonly ctx : CanvasRenderingContext2D
    private nodeRadius : number
    private nodeLineWidth : number
    private connectionLineWidth : number
    private innerEdgeBoundary : number
    private outerEdgeBoundary : number
    private triangleRadius : number
    private triangleSize : number
    // private zoom : number
    readonly connectionsCache : ConnectionsCache

    constructor(
        g : NuniGraph, 
        canvas : HTMLCanvasElement, 
        snapToGridBtn : HTMLElement) {

        this.fromNode = null
        this.g = g
        this.canvas = canvas
        this.snapToGrid = false
        this.ctx = canvas.getContext('2d')!
        this.nodeRadius = 25
        this.nodeLineWidth = this.nodeRadius/5 + 3
        this.connectionLineWidth = PHI
        this.innerEdgeBoundary = this.nodeRadius / 1.5
        this.outerEdgeBoundary = this.nodeRadius + this.nodeLineWidth
        this.triangleRadius = this.nodeRadius / 3.0
        this.triangleSize = this.innerEdgeBoundary
        // this.zoom = 1
        this.connectionsCache = {}

        // window.onwheel = (e : WheelEvent) => {
            // const direction = 2 **  Math.sign(e.deltaY)
            // this.setNodeRadius(this.nodeRadius /= direction)
            // this.zoom /= direction

        //     this.render()
        // }

        snapToGridBtn.onclick = () => {
            this.snapToGrid = snapToGridBtn.classList.toggle('selected')
            this.render()
        }
    }

    setNodeRadius(r : number) {
        this.nodeRadius = r
        this.nodeLineWidth = this.nodeRadius/5 + 3
        this.connectionLineWidth = PHI
        this.innerEdgeBoundary = this.nodeRadius / 1.5
        this.outerEdgeBoundary = this.nodeRadius + this.nodeLineWidth
        this.triangleRadius = this.nodeRadius / 3.0
        this.triangleSize = this.innerEdgeBoundary
    }

    private dashedBox(x : number, y : number, X : number, Y : number) {
        const { ctx } = this
        ctx.setLineDash([5,3])
        ctx.strokeStyle = '#aaa'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.strokeRect(X, Y, x - X, y - Y)
        ctx.setLineDash([])
        return
    }

    private circle(x : number, y : number, r : number) {
        const { ctx } = this
        ctx.beginPath()
        ctx.arc(x,y,r,0,7)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }


    private line(x1 : number, y1 : number, x2 : number, y2 : number) {
        const { ctx } = this
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(x2,y2)
        ctx.stroke()
        ctx.closePath()
    }

    private directedLine(x1 : number, y1 : number, x2 : number, y2 : number, 
        cacheOptions? : { 
            fromId : number, 
            toId : number, 
            connectionType : ConnectionType, x? : number, y? : number }) {

        /** The inputs (x1,y1,x2,y2) are the coordinates of the centers of nodes.
         *  If cacheOptions is falsy, the connection line hasn't been set and is being dragged by the user.
         */ 

        const { ctx, nodeRadius, nodeLineWidth, 
            connectionsCache, triangleRadius
            } = this

        ctx.fillStyle = 'cyan'
        
        // Get the line coordinates:
        const delta = nodeRadius + nodeLineWidth
        const m = (y1-y2)/(x1-x2)                // the slope of the line
        const angle = Math.atan(m)               // angle
        const dy = Math.sin(angle) * delta       // line shift y 
        const dx = Math.cos(angle) * delta       // line shift x 
        const z = x1 >= x2 ? -1 : 1              // invert deltas
        const W = cacheOptions ? 1 : 0           // trim line end
        const [x,y,X,Y] =                        // line coordinates
            [x1+dx*z, y1+dy*z, x2-dx*z*W, y2-dy*z*W]


        if (cacheOptions) { 
        // If the connection has already been set:

            const { fromId, toId, connectionType, x, y } = cacheOptions
            const c_id = `${fromId}:${toId}:${connectionType}`
            const data = 
                connectionsCache[c_id] = 
                connectionsCache[c_id] || { fromId, toId, connectionType }

            // Update/set the location of the arrowhead/triangle
            data.x = X - dx * z * W / 3.0
            data.y = Y - dy * z * W / 3.0

            if (x && y && 
                distance(x, y, data.x,data.y) < triangleRadius) {
            // Highlight the connection arrow because the user is hovering over it
                ctx.fillStyle = 'orange' 
            }
        }
        
        this.line(x,y,X,Y)
        this.drawDirectionTriangle(X, Y, angle, x >= X)
    }

    private drawGridLines(
        H : number, 
        W : number, 
        buttons = -1, 
        selectedNodes : NuniGraphNode[]) {
        const { ctx, g } = this
        ctx.lineWidth = 0.2
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        const gridGrap = W/25

        for (let i = 0; i < W; i += gridGrap) {
            this.line(0,i,W,i)
            this.line(i,0,i,H)
        }
        
        if (buttons === 0) { // snap these nodes to the grid
            for (const node of selectedNodes) {
                const {x,y} = node
                const [X,Y] = [x*W, y*H]
                const [newX, newY] = [
                    Math.round(X / gridGrap) * gridGrap / W, 
                    Math.round(Y / gridGrap) * gridGrap / H]
    
                if (!g.nodes.some(node => node.x === newX && node.y === newY)) {
                // the condition prevents the user from stacking nodes
                    node.x = newX
                    node.y = newY
                }
            }
        }
    }


    private drawDirectionTriangle(
        x : number, y : number, angle : number, flipH : boolean) {

        const { ctx, triangleSize } = this
        const h = (flipH ? 1 : -1) * triangleSize
        const dt = 0.5
        const dt1 = angle + dt
        const dt2 = angle - dt

        ctx.translate(x,y)
        ctx.rotate(dt1)
        ctx.beginPath()

        ctx.moveTo(0,0)
        ctx.lineTo(h,0)
        ctx.rotate(-dt1)
        ctx.rotate(dt2)
        ctx.lineTo(h,0)
        ctx.lineTo(0,0)

        ctx.fill()

        ctx.closePath()
        ctx.rotate(-dt2)
        ctx.translate(-x,-y)
    }

    private getParallelConnectionGroups(fromId : number) {
        return this.g.oneWayConnections[fromId].reduce((groups, v) => 
            ({ 
                ...groups, 
                [v.id] : [...(groups[v.id] || []), v] 
            })
            , {} as Indexable<ConnecteeDatum[]>)
    }

    private drawNodeConnections(
        nodes : NuniGraphNode[], { H, W, x, y } : GraphRenderOptions) {

        const { ctx, connectionLineWidth, nodeRadius, g } = this
        ctx.lineWidth = connectionLineWidth
        for (const id1 in g.oneWayConnections) {
            const fromId = +id1
            const idGroups = this.getParallelConnectionGroups(fromId)
            
            // Draw the group of parallel connections
            for (const i in idGroups) {
                const groups = idGroups[i]
                const connections = groups.length
                groups.forEach(({ id: toId, connectionType }, i) => {
                    
                    const a = nodes.find(node => node.id === fromId)!
                    const b = nodes.find(node => node.id === toId)!
                    const [xa,ya] = [ a.x*W, a.y*H ]    // node a coords
                    const [xb,yb] = [ b.x*W, b.y*H ]    // node b coords
                    const mP = -(xa-xb)/(ya-yb)         // slope of perpendicular line
                    const shift = nodeRadius / 2.0      // gap between parallel connections
                    const theta = Math.atan(mP)
                    const dy2 = Math.sin(theta) * shift  
                    const dx2 = Math.cos(theta) * shift
                    const I = i - (connections-1) / 2.0
                    const [x1,x2] = [xa + dx2 * I, xb + dx2 * I]
                    const [y1,y2] = [ya + dy2 * I, yb + dy2 * I]
                    
                    ctx.strokeStyle = ConnectionTypeColors[connectionType]

                    this.directedLine(x1,y1,x2,y2, { fromId, toId, connectionType, x, y })
                })
            }
        }
    }

    private getNodeColor(node : NuniGraphNode, H : number, W : number, highlight : boolean) {
        const { nodeRadius, ctx } = this
        if ([NodeTypes.SGS, NodeTypes.B_SEQ]
            .includes(node.type)) {

            const c2 = highlight ? 'pink' : 'black'
            const {x,y} = node, r = nodeRadius
            const gradient = ctx.createRadialGradient(x*W, y*H, r/27.0, x*W, y*H, r)
                gradient.addColorStop(0, 'gray')
                gradient.addColorStop(0.9, c2) 
                
            return gradient
        }
        const prop = (<Indexed>AudioNodeParams)[node.type][0]
        const pValue = node.audioParamValues[prop]
        const [min,max] = (<Indexed>AudioParamRanges)[prop]
        const factor = Math.log2(pValue-min) / (Math.log2(max-min) || 0.5)
        const cval = factor * 4
        const c1 = `rgb(${ [0,1,2].map(n => 100 * (1 + Math.sin(cval + n * twoThirdsPi)) |0).join(',') })`
        const c2 = highlight ? 'pink' : 'black'
        const {x,y} = node, r = nodeRadius
        const gradient = ctx.createRadialGradient(x*W, y*H, r/27.0, x*W, y*H, r)
            gradient.addColorStop(0, c1)
            gradient.addColorStop(0.9, c2) 
            
        return gradient
    }

    private drawNodes(
        nodes : NuniGraphNode[], options : GraphRenderOptions) {
            
        const { canvas, ctx, nodeRadius, 
            fromNode, nodeLineWidth
            } = this

        const {
            H, W,
            buttons,
            hover_type,
            hover_id,
            selectedNodes
            } = options

            const isSelect = hover_type === HOVER.SELECT
            const isEdge   = hover_type === HOVER.EDGE

        canvas.style.cursor = 
            isSelect || (fromNode && isEdge) 
            ? buttons === 1 ? 'grabbing' : 'grab'
            : isEdge ? 'crosshair'
            : 'default'

        for (const node of nodes) {
            
            const [X,Y] = [node.x * W, node.y * H]
            const isTarget = node.id === hover_id

            const highlightEdge =
                !fromNode &&
                isTarget && 
                hover_type === HOVER.EDGE

            const highlightCenter = 
                selectedNodes.includes(node) ||
                (isTarget && (fromNode || hover_type === HOVER.SELECT)) 
                ? true : false


            ctx.strokeStyle = 
                highlightEdge 
                ? 'rgba(255,255,255,0.75)' 
                : node.id === 0 ? MasterGainColor : NodeTypeColors[node.type]

            ctx.lineWidth = nodeLineWidth
            ctx.shadowBlur = 0
            ctx.shadowColor = ''
            ctx.fillStyle = 
                this.getNodeColor(
                    node,
                    H, 
                    W, 
                    highlightCenter)

            
            if (highlightCenter) {
                ctx.shadowBlur = nodeRadius * 2.0
                ctx.shadowColor = 'rgba(255, 255, 255, .2)'
            }
            
            this.circle(X, Y, nodeRadius)
        }
    }

    render(options = {}) {
        
        const { g, snapToGrid, canvas, ctx, 
            fromNode, connectionLineWidth 
            } = this

        const nodes = g.nodes
        const W = canvas.width = canvas.offsetWidth
        const H = canvas.height = canvas.offsetHeight

        const { 
            x, 
            y,
            buttons, 
            selectionStart, 
            selectedNodes
            } = options as GraphRenderOptions
        const innerOptions = { ...options, H, W, selectedNodes: selectedNodes||[] }

        ctx.font = '15px Arial'
        ctx.clearRect(0,0,W,H)
    
        if (snapToGrid) {
            this.drawGridLines(H, W, buttons, selectedNodes)
        }

        if (selectionStart) {
            const [X,Y] = selectionStart
            this.dashedBox(x!, y!, X, Y)
        }
        
        this.drawNodeConnections(nodes, innerOptions)
        this.drawNodes(nodes, innerOptions)

        if (fromNode) { // draw the connection currently being made
            const [X,Y] = [fromNode.x*W, fromNode.y*H]
            ctx.lineWidth = connectionLineWidth
            ctx.strokeStyle = 'white'
            this.directedLine(X, Y, x!, y!)
        }
    }

    getGraphMouseTarget({ offsetX: x, offsetY: y } : { offsetX : number, offsetY : number }) {
        
        const { canvas, g, innerEdgeBoundary, outerEdgeBoundary,
            connectionsCache, triangleRadius 
            } = this
        const { width: W, height: H } = canvas
        const nodes = g.nodes

        /** Check if nodes were clicked.
         *  Why the outer loop? To prioritize being able
         *  to drag nodes over making connection arrows.
         *  */ 
        for (const checkNodeClicked of [true,false]) {
            for (const node of nodes) {
                const [X,Y] = [node.x*W, node.y*H]
                const d = distance(x,y,X,Y)
                const aroundEdge = 
                    innerEdgeBoundary < d && d < outerEdgeBoundary
    
                if (checkNodeClicked) {
                    if (d < innerEdgeBoundary) {
                        return { type: HOVER.SELECT, node }
                    }
                } else {
                    if (aroundEdge) { 
                        return { type: HOVER.EDGE, node }
                    }
                }
            }
        }
        
        // Check if any connection-triangles were clicked:
        for (const id in connectionsCache) {
            const { x:X, y:Y } = connectionsCache[id]
            if (distance(x, y, X, Y) < triangleRadius) {
                return { type: HOVER.CONNECTION, id }
            }
        }
        
        // Nothing was clicked
        return { type: HOVER.EMPTY }
    }
}
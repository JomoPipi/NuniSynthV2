/**
 * The GraphCanvas draws the canvas, and allows the user to interact with it.
 */
const GraphCanvas = (_ => {
    const canvas = D('nunigraph')! as HTMLCanvasElement

    const ctx = canvas.getContext('2d')!

    const nodeRadius = 20

    const innerEdgeBoundary = nodeRadius / 1.5
    
    const outerEdgeBoundary = nodeRadius * 1.1

    const triangleRadius = nodeRadius / 4.0

    // const [ nodeHoverColor ] = ['--hover-node'].map(s =>
    //     getComputedStyle(document.documentElement).getPropertyValue(s)) // getting CSS variable

    const snapToGrid = D('snap-to-grid')! as HTMLInputElement
    snapToGrid.oninput = () => render()

    let fromNode = null as NuniGraphNode | null

    const connectionsCache : {
        [id:string] : { 
            x:number, 
            y:number, 
            fromId:number, 
            toId:number, 
            connectionType: ConnectionType 
        }
    } = {}

    const circle = (x: number, y: number, r: number) => {
        ctx.beginPath()
        ctx.arc(x,y,r,0,7)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }

    const line = (x1: number,y1: number, x2: number, y2: number) => {
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(x2,y2)
        ctx.stroke()
        ctx.closePath()
    }

    const directedLine = (x1: number,y1: number, x2: number, y2: number, 
    cacheOptions? : { fromId: number, toId: number, connectionType: ConnectionType, clientX?: number, clientY?: number } ) => {
    /// The inputs are the coordinates of the centers of nodes.
    /// This function trims the length of the line before drawing it, as of right now.

        const m = (y1-y2)/(x1-x2)
        const angle = Math.atan(m)
        const dy = Math.sin(angle) * nodeRadius  
        const dx = Math.cos(angle) * nodeRadius
        const z = x1 >= x2 ? -1 : 1
        const W = !cacheOptions ? 0 : 1
        const [x,y,X,Y] = [x1+dx*z, y1+dy*z, x2-dx*z*W, y2-dy*z*W]

        ctx.fillStyle = 'cyan'
        if (cacheOptions) {
            const { fromId, toId, connectionType, clientX, clientY } = cacheOptions
            const c_id = `${fromId}:${toId}:${connectionType}`
            const data = 
                connectionsCache[c_id] = connectionsCache[c_id] || {fromId,toId,connectionType}

            data.x = X - dx * z * W / 3.0
            data.y = Y - dy * z * W / 3.0

            if (clientX && clientY && distance(clientX,clientY,data.x,data.y) < triangleRadius) {
                ctx.fillStyle = 'white' // highlight the connection arrow because the user is hovering over it
            }
        }
        
        line(x,y,X,Y)
        drawDirectionTriangle(X, Y, angle, x >= X)
    }

    const drawGridLines = (H:number, W:number) => {
        const step = W/20
        ctx.lineWidth = 0.2
        ctx.strokeStyle = '#777'
        for (let i = 0; i < W; i += step) line(i,0,i,H)
        for (let i = 0; i < W; i += step) line(0,i,W,i)

        const node = G.selectedNode
        if (node) {
            const {x,y} = node
            const [X,Y] = [x*W, y*H]
            const [newX, newY] = [
                Math.round(X / step) * step / W, 
                Math.round(Y / step) * step / H]

            if (!G.nodes.some(node => node.x === newX && node.y === newY)) {
                // discourage the user from visually stacking nodes
                node.x = newX
                node.y = newY
            }
        }
    }

    const drawDirectionTriangle = 
        (x : number, y : number, angle: number, flipH : boolean) => {

        const h = (flipH ? 1 : -1) * nodeRadius / 2.0
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

    const drawNodeConnections = (nodes : NuniGraphNode[], H : number, W : number, 
    { clientX, clientY } : { clientX?: number, clientY?: number }) => {

        for (const id1 in G.oneWayConnections) {

            // gather the groups of parallel connections
            const idGroups = G.oneWayConnections[id1].reduce((groups, v) => {
                const group = groups[v.id]
                if (group) {
                    group.push(v)
                } else {
                    groups[v.id] = [v]
                }
                return groups
            }, {} as { [key:number] : undefined | ConnecteeDatum[] })
            
            for (const i in idGroups) {
                const groups = idGroups[i]!
                const connections = groups.length
                groups.forEach(({ id, connectionType } ,i) => {

                    const a = nodes.find(node => node.id === +id1)!
                    const b = nodes.find(node => node.id === id)!
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

                    directedLine(x1,y1,x2,y2, { fromId: +id1, toId: id, connectionType, clientX, clientY })
                })
            }
        }
    }

    const getNodeColor = (node : NuniGraphNode, H: number, W:number) => {
        
        const prop = (<Indexible>AudioNodeParams)[node.type][0]
        const pValue = node.audioParamValues[prop]
        const [min,max] = (<Indexible>AudioParamRanges)[prop]
        const factor = Math.log2(pValue-min)/Math.log2(max-min) 
        const TAU = 2 * Math.PI
        const twoThirdsPi = TAU / 3.0
        const cval = factor * 4
        const c1 = 'rgb(' + [0,1,2].map(n => 100 * (1 + Math.sin(cval + n * twoThirdsPi)) |0).join(',') + ')'
        const c2 = G.selectedNode === node ? 'purple' : 'black'
        const {x,y} = node, r = nodeRadius
        const gradient = ctx.createRadialGradient(x*W, y*H, r/4, x*W, y*H, r)
            gradient.addColorStop(0, c1)
            gradient.addColorStop(0.9, c2)

        return gradient
    }

    const drawNodes = (nodes : NuniGraphNode[], H : number, W : number, 
    options : { selectedNodes?: NuniGraphNode[], clientX?: number, clientY?: number, buttons?: number }) => {
        const { selectedNodes, clientX, clientY, buttons } = options
        const [x,y] = [clientX, clientY]
        canvas.style.cursor = 'default'
        for (const node of nodes) {
            
            const [X,Y] = [node.x * W, node.y * H]
            const d = x && y ? distance(x,y,X,Y) : Infinity
            const innerBound = fromNode ? 0 : innerEdgeBoundary
            const aroundEdge = innerBound <= d && d < outerEdgeBoundary
            const hoveringInside = d <= innerEdgeBoundary
            const shouldHighlight = hoveringInside && !fromNode
            
            ctx.strokeStyle = aroundEdge ? 'white' :
                node.id === 0 ? '#222' : NodeTypeColors[node.type]

            ctx.fillStyle = getNodeColor(node, H, W)

            if (selectedNodes) {
                ctx.fillStyle = selectedNodes.indexOf(node) >= 0 ? 'red' : 'yellow'
            }

            if (shouldHighlight)
                canvas.style.cursor = buttons === 1 ? 'grabbing' : 'grab' 
            else if (aroundEdge)
                canvas.style.cursor = 'crosshair'
            
            circle(X, Y, nodeRadius)

            ctx.fillStyle = 'white'
            ctx.fillText(
                node.id === 0 ? 'master-gain' : node.type,
                X - nodeRadius * 1.5, 
                Y - nodeRadius * 1.5
            )
        }
    }

    const render = (options = {}) => {
        const nodes = G.nodes
        const W = canvas.width = canvas.offsetWidth
        const H = canvas.height = canvas.offsetHeight
        const { clientX, clientY, buttons } = options as any

        ctx.font = '15px Arial '
        ctx.clearRect(0,0,W,H)
    
        if (snapToGrid.checked) {
            drawGridLines(H,W)
        }
        ctx.lineWidth = 2
        drawNodeConnections(nodes, H, W, options)
        drawNodes(nodes, H, W, options)

        if (fromNode) { // draw the connection currently being made
            const [X,Y] = [fromNode.x*W, fromNode.y*H]
            
            ctx.strokeStyle = 'white'
            directedLine(X,Y,clientX,clientY)
        }
    }
    
    // node interaction
    const onmousedown = function(e : MouseEvent) {
        const W = canvas.width
        const H = canvas.height
        const nodes = G.nodes
        const [x,y] = [e.clientX, e.clientY]

        // edit existing connection
        for (const id in connectionsCache) {
            const { x:X, y:Y, fromId, toId, connectionType } = connectionsCache[id]
            if (distance(x,y,X,Y) < triangleRadius) {
                G.unselectNode()
                fromNode = G.nodes.find(node => node.id === fromId)!
                const to = G.nodes.find(node => node.id === toId)!
                delete connectionsCache[id]
                G.disconnect(fromNode, to, connectionType)
                return;
            }
        }

        // handle node touch
        for (const node of nodes) {
            const [X,Y] = [node.x*W, node.y*H]
            const d = x && y ? distance(x,y,X,Y) : -1
            const aroundEdge = innerEdgeBoundary < d && d < outerEdgeBoundary

            if (aroundEdge) { 
                // start make a connection
                G.unselectNode()
                fromNode = node
                return;
            }
            else if (d < nodeRadius) {
                G.selectNode(node)
                render()
                return;
            }
        }
        
        if (G.selectedNode) G.unselectNode()
        render()
    }

    const onmousemove = function(e : MouseEvent) {
        
        // drag nodes
        const leftClickHeld = e.buttons === 1
        const [x,y] = [e.clientX, e.clientY]
        
        if (leftClickHeld && G.selectedNode) {
            const W = canvas.width
            const H = canvas.height
            const node = G.selectedNode

            node.x = x/W
            node.y = y/H
        }
        
        render(e)
    }

    const onmouseup = function(e : MouseEvent) {
        if (!fromNode) return;

        const W = canvas.width
        const H = canvas.height
        const nodes = G.nodes
        const [x,y] = [e.clientX, e.clientY]

        for (const node of nodes) {
            if (node === fromNode) continue
            const [X,Y] = [node.x*W, node.y*H]
            const d = x && y ? distance(x,y,X,Y) : Infinity
            if (d < outerEdgeBoundary) {
                promptUserToSelectConnectionType
                    (fromNode, node)
                    
                fromNode = null
                return;
            }
        }
        fromNode = null
        render()
    }

    canvas.onmousedown = onmousedown
    canvas.onmousemove = onmousemove
    canvas.onmouseup   = onmouseup

    return {
        nodeRadius: nodeRadius,
        canvas: canvas,
        ctx: ctx,
        render: render, 
    }
})()

function promptUserToSelectConnectionType(
    node1 : NuniGraphNode, node2 : NuniGraphNode) {
    if (node2.id === 0) {
        /// No prompt needed in this case. Only allow channel connections to the master gain node.
        /// Allowing connections to someGain.gain can prevent it from being muted.
       G.connect(node1, node2, 'channel')
       return;
    }
    const prompt = D('connection-type-prompt')!
    const types = 
        (SupportsInputChannels[node2.type] ? ['channel'] : [])
        .concat(AudioNodeParams[node2.type])

    prompt.style.display = 'block'
    prompt.innerHTML= ''
    for (const param of types as ConnectionType[]) {
        const btn = document.createElement('button')
        btn.innerHTML = param
        btn.classList.add('connection-button')
        btn.onclick = () =>
        {
            G.connect(node1, node2, param)
            prompt.style.display = 'none'
            GraphCanvas.render()
        }
        prompt.appendChild(btn)
    }
}
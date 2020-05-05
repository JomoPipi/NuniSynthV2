






function createGraphCanvas(g : NuniGraph, canvas : HTMLCanvasElement) {
/**
 * The GraphCanvas draws the graph on the canvas, and allows the user to interact with it.
 */








    // CONSTANTS //_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________

    let fromNode = null as NuniGraphNode | null
    const ctx = canvas.getContext('2d')!
    const nodeRadius = 17
    const nodeLineWidth = 8
    const connectionLineWidth = PHI
    const innerEdgeBoundary = nodeRadius / 1.5
    const outerEdgeBoundary = nodeRadius + nodeLineWidth
    const triangleRadius = nodeRadius / 3.0
    const triangleSize = innerEdgeBoundary

    const textGradient = (() => { 
        const gradient = ctx.createLinearGradient(0,0,0,1000)
        for (let i = 0; i < 1; i += .002) {
            gradient.addColorStop(
                i, 
                "#" + [0,0,0].map(_=>
                    'fedcba9876543'[Math.random()*8|0]).join('')
                    )
        }
        return gradient
    })()

    const snapToGrid = D('snap-to-grid')! as HTMLInputElement
        snapToGrid.oninput = () => render()

    // How to get CSS variable:
    // const [ nodeTextColor ] = ['--node-text'].map(s =>
    //     getComputedStyle(document.documentElement).getPropertyValue(s))

    const connectionsCache : {
        /** We need this to store the locations of triangles in connection lines,
         *  so that the user can undo connections by clicking on the triangles.
         *  This is very similar to g.oneWayConnections, maybe it can be merged.
         */ 
        [connectionId : string] : { 
            x : number, 
            y : number, 
            fromId : number, 
            toId : number, 
            connectionType : ConnectionType 
        }
        } = {}
        







    // FUNCTIONS //_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________
    const circle = (x : number, y : number, r : number) => {
        ctx.beginPath()
        ctx.arc(x,y,r,0,7)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
    }


    const line = (x1 : number, y1 : number, x2 : number, y2 : number) => {
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(x2,y2)
        ctx.stroke()
        ctx.closePath()
    }


    const directedLine = (x1 : number, y1 : number, x2 : number, y2 : number, 
        cacheOptions? : { 
            fromId : number, 
            toId : number, 
            connectionType : ConnectionType, offsetX? : number, offsetY? : number }) => {

        /** The inputs (x1,y1,x2,y2) are the coordinates of the centers of nodes.
         *  If cacheOptions is falsy, the connection line hasn't been set and is being dragged by the user.
         */ 

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

            const { fromId, toId, connectionType, offsetX, offsetY } = cacheOptions
            const c_id = `${fromId}:${toId}:${connectionType}`
            const data = 
                connectionsCache[c_id] = 
                connectionsCache[c_id] || { fromId, toId, connectionType }

            // Update the location of the arrowhead/triangle
            data.x = X - dx * z * W / 3.0
            data.y = Y - dy * z * W / 3.0

            if (offsetX && offsetY && distance(offsetX,offsetY,data.x,data.y) < triangleRadius) {
            // Highlight the connection arrow because the user is hovering over it
                ctx.fillStyle = 'orange' 
            }
        }
        
        line(x,y,X,Y)
        drawDirectionTriangle(X, Y, angle, x >= X)
    }


    const drawGridLines = (H : number, W : number, buttons? : number) => {
        ctx.lineWidth = 0.2
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        const gridGrap = W/25

        for (let i = 0; i < W; i += gridGrap) {
            line(0,i,W,i)
            line(i,0,i,H)
        }

        const node = g.selectedNode
        if (node && buttons === 0) { // snap this node to the grid
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


    const drawDirectionTriangle = 
        (x : number, y : number, angle : number, flipH : boolean) => {

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


    const drawNodeConnections = (nodes : NuniGraphNode[], H : number, W : number, 
    { offsetX, offsetY } : { offsetX? : number, offsetY? : number }) => {
        ctx.lineWidth = connectionLineWidth
        for (const id1 in g.oneWayConnections) {
            const fromId = +id1 
            // gather the groups of parallel connections
            const idGroups = g.oneWayConnections[fromId].reduce((groups, v) => {
                const group = groups[v.id]
                if (group) {
                    group.push(v)
                } else {
                    groups[v.id] = [v]
                }
                return groups
            }, {} as { [key:number] : ConnecteeDatum[] })
            
            for (const i in idGroups) {
                const groups = idGroups[i]!
                const connections = groups.length
                groups.forEach(({ id: toId, connectionType } ,i) => {

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

                    directedLine(x1,y1,x2,y2, { fromId, toId, connectionType, offsetX, offsetY })
                })
            }
        }
    }


    const getNodeColor = (node : NuniGraphNode, H : number, W : number) => {
        
        const prop = (<Indexed>AudioNodeParams)[node.type][0]
        const pValue = node.audioParamValues[prop]
        const [min,max] = (<Indexed>AudioParamRanges)[prop]
        const factor = Math.log2(pValue-min) / (Math.log2(max-min) || 0.5)
        const cval = factor * 4
        const c1 = `rgb(${ [0,1,2].map(n => 100 * (1 + Math.sin(cval + n * twoThirdsPi)) |0).join(',') })`
        const c2 = g.selectedNode === node ? 'pink' : 'black'
        const {x,y} = node, r = nodeRadius
        const gradient = ctx.createRadialGradient(x*W, y*H, r/27.0, x*W, y*H, r)
            gradient.addColorStop(0, c1)
            gradient.addColorStop(0.9, c2) 
            
        return gradient
    }


    const drawNodes = (nodes : NuniGraphNode[], H : number, W : number, 
        options : { 
            selectedNodes? : NuniGraphNode[], 
            offsetX? : number, offsetY? : number, buttons? : number }) => {

        const { selectedNodes, offsetX, offsetY, buttons } = options
        const [x,y] = [offsetX, offsetY]
        canvas.style.cursor = 'default'
        ctx.shadowBlur = nodeRadius * 2.0
        ctx.shadowColor = 'rgba(255, 255, 255, .2)'
        for (const node of nodes) {
            
            const [X,Y] = [node.x * W, node.y * H]
            const d = x && y ? distance(x,y,X,Y) : Infinity
            const innerBound = fromNode ? 0 : innerEdgeBoundary
            const aroundEdge = innerBound <= d && d < outerEdgeBoundary
            const hoveringInside = d <= innerEdgeBoundary
            const shouldHighlight = hoveringInside && !fromNode
            
            ctx.strokeStyle = aroundEdge ? 'rgba(255,255,255,0.75)' :
                node.id === 0 ? '#222' : NodeTypeColors[node.type]

            ctx.lineWidth = nodeLineWidth
            ctx.fillStyle = getNodeColor(node, H, W)

            if (selectedNodes) { // Not being used, currently
                ctx.fillStyle = selectedNodes.indexOf(node) >= 0 ? 'red' : 'gray'
            }

            if (shouldHighlight)
                canvas.style.cursor = buttons === 1 ? 'grabbing' : 'grab' 
            else if (aroundEdge)
                canvas.style.cursor = 'crosshair'
            
            circle(X, Y, nodeRadius)

            // There is a legend, now. I will see if people like it.
            // ctx.fillStyle = NodeTypeColors[node.type] //textGradient//nodeTextColor
            // ctx.fillText(
            //     node.id === 0 ? 'master-gain' : node.title,
            //     X - nodeRadius * 1.5, 
            //     Y - nodeRadius * 1.5
            // )
        }
    }


    const render = (options = {}) => {
        const nodes = g.nodes
        const W = canvas.width = canvas.offsetWidth
        const H = canvas.height = canvas.offsetHeight
        const { offsetX, offsetY, buttons } = options as MouseEvent

        ctx.font = '15px Arial'
        ctx.clearRect(0,0,W,H)
    
        if (snapToGrid.checked) {
            drawGridLines(H,W,buttons)
        } 

        drawNodeConnections(nodes, H, W, options)
        drawNodes(nodes, H, W, options)

        if (fromNode) { // draw the connection currently being made
            const [X,Y] = [fromNode.x*W, fromNode.y*H]
            ctx.lineWidth = connectionLineWidth
            ctx.strokeStyle = 'white'
            directedLine(X,Y,offsetX,offsetY)
        }
    }
    





    let mouse_is_down = false

    // NODE INTERACTION HANDLERS //_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________//_____________
    const onmousedown = function(e : MouseEvent) {
        mouse_is_down = true
        const W = canvas.width
        const H = canvas.height
        const nodes = g.nodes
        const [x,y] = [e.offsetX, e.offsetY]
        
        hideGraphContextmenu()

        /** Check if nodes were clicked.
         *  Why the outer loop? To prioritize being able
         *  to drag nodes over making connection arrows.
         *  */ 
        for (const checkNodeClicked of [true,false]) {
            for (const node of nodes) {
                const [X,Y] = [node.x*W, node.y*H]
                const d = x && y ? distance(x,y,X,Y) : -1
                const aroundEdge = innerEdgeBoundary < d && d < outerEdgeBoundary
    
                if (checkNodeClicked) {
                    if (d < innerEdgeBoundary) {
                        g.selectNode(node)
                        render()
                        return;
                    }
                } else {
                    if (aroundEdge) { 
                        g.unselectNode()
                        fromNode = node // Start making a connection
                        return;
                    }
                }
            }
        }
        
        // Check if any connection-triangles were clicked:
        for (const id in connectionsCache) {
            const { x:X, y:Y, fromId, toId, connectionType } = connectionsCache[id]
            if (distance(x,y,X,Y) < triangleRadius) {
                UndoRedoModule.save()
                g.unselectNode()
                fromNode = g.nodes.find(node => node.id === fromId)!
                const to = g.nodes.find(node => node.id === toId)!
                delete connectionsCache[id]
                g.disconnect(fromNode, to, connectionType)
                return;
            }
        }
        
        // Nothing was clicked
        if (g.selectedNode) g.unselectNode()
        render()
    }


    const onmousemove = function(e : MouseEvent) {

        const pressing = e.buttons === 1 && mouse_is_down
        
        if (pressing && g.selectedNode) {
            // Drag the selected node
            const W = canvas.width
            const H = canvas.height
            const node = g.selectedNode

            node.x = e.offsetX/W
            node.y = e.offsetY/H
        }
        render(e)
    }


    const onmouseup = function(e : MouseEvent) {
        mouse_is_down = false
        if (!fromNode) return;
        // Connect fromNode to the destination

        const W = canvas.width
        const H = canvas.height
        const nodes = g.nodes
        const [x,y] = [e.offsetX, e.offsetY]

        for (const node of nodes) {
            if (node === fromNode) continue
            const [X,Y] = [node.x*W, node.y*H]
            const d = x && y ? distance(x,y,X,Y) : Infinity
            if (d < outerEdgeBoundary) {
                promptUserToSelectConnectionType
                    (fromNode, node, x, y)
                    
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


    // Ask the user where to connect the node
    function promptUserToSelectConnectionType(
        node1 : NuniGraphNode, node2 : NuniGraphNode, x : number, y : number) {
            
        if (node2.id === 0) {
            // No prompt needed in this case. 
            // Only allow channel connections to the master gain node.
            // Allowing connections to someGain.gain can prevent it from being muted.
            UndoRedoModule.save()
            g.connect(node1, node2, 'channel')
            return;
        }
        const prompt = D('connection-type-prompt')!
        const types = 
            (SupportsInputChannels[node2.type] ? ['channel'] : [])
            .concat(AudioNodeParams[node2.type])

        prompt.classList.add('show')
        prompt.innerHTML= ''
        for (const param of types as ConnectionType[]) {
            const btn = E('button')
            btn.innerHTML = param
            btn.onclick = () =>
            {
                UndoRedoModule.save()
                g.connect(node1, node2, param)
                prompt.classList.remove('show')
                render()
            }
            prompt.appendChild(btn)
        }
        const cancel = E('button')
        cancel.innerHTML = 'cancel'
        cancel.classList.add('connection-button')
        cancel.onclick = () => prompt.classList.remove('show')
        prompt.appendChild(cancel)

        // Place the prompt in an accessible location
        UI_clamp(x, y + 40, prompt, canvas)
    }

    return {
        canvas: canvas,
        render: render, 
    }
}
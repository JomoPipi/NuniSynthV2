
const GraphCanvas = (_ => {

    const canvas = D('nunigraph')! as HTMLCanvasElement

    const ctx = canvas.getContext('2d')!

    const nodeRadius = 20

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
    const drawDirectionTriangle = 
        (xa : number, ya : number, xb : number, yb : number) => {
        /**
         * Draws a directional triangle at the midpoint of a line.
         */

        const [mx,my] = [(xa+xb)/2.0, (ya+yb)/2.0]
        
        const m = (ya - yb) / (xa - xb)
        const theta = Math.atan(m)
        const h = xa >= xb ? 10 : -10
        const dt = 0.5
        const dt1 = theta + dt
        const dt2 = theta - dt

        ctx.translate(mx,my)
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
        ctx.translate(-mx,-my)
    }


    const render = (selectedNodes? : NuniGraphNode[]) => {
        const nodes = G.nodes
        const W = canvas.width = canvas.offsetWidth
        const H = canvas.height = canvas.offsetHeight

        ctx.font = '15px Arial '
        ctx.lineWidth = 2

        const color = G.isPromptingUserToSelectConnectee ? 'blue' : 'transparent'

        ctx.clearRect(0,0,W,H)
        ctx.fillStyle = 'cyan'

        
        // Draw the node connections with lines
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
                groups.forEach((data,i) => {
                    const { id, connectionType } = data

                    const a = nodes.find(node => node.id === +id1)!
                    const b = nodes.find(node => node.id === id)!
                    
                    const shift = 10                    // parallel connection gap
                    const I = i - (connections-1) / 2.0 // centering the connections
                    const [xa,ya] = [ a.x*W, a.y*H ]    // node a coords
                    const [xb,yb] = [ b.x*W, b.y*H ]    // node b coords
                    const m = -(xa-xb)/(ya-yb)          // slope of perpendicular line
                    const theta = Math.atan(m)
                    const dy = Math.sin(theta) * shift  
                    const dx = Math.cos(theta) * shift
                    
                    const [x1,x2] = [xa + dx * I, xb + dx * I]
                    const [y1,y2] = [ya + dy * I, yb + dy * I]
                    
                    ctx.strokeStyle = ConnectionTypeColors[connectionType]
                    line(x1,y1,x2,y2)
                    drawDirectionTriangle(x1,y1,x2,y2)
                })
            }
        }

        ctx.strokeStyle = 'gray'
        ctx.fillStyle = 'black'
        for (const node of nodes) {

            ctx.fillStyle = node === G.selectedNode ? 'green' : color

            if (selectedNodes) {
                ctx.fillStyle = selectedNodes.indexOf(node) >= 0 ? 'purple' : 'yellow'
            }
            
            const [X,Y] = [node.x * W, node.y * H]

            ctx.strokeStyle = NodeTypeColors[node.type]
            circle(X, Y, nodeRadius)

            ctx.fillStyle = 'white'
            
            ctx.fillText(
                node.id === 0 ? 'master-gain' : node.type,
                X - nodeRadius * 1.5, 
                Y - nodeRadius * 1.5
            )
        }

    }
    
// the next 3 functions do more than just Render.
    const onmousedown = function(e : MouseEvent) {
        const W = canvas.width
        const H = canvas.height
        const nodes = G.nodes
        const [x,y] = [e.clientX, e.clientY]
        for (const node of nodes) {
            if (((x-node.x*W)**2 + (y-node.y*H)**2)**0.5 < nodeRadius) {

                if (G.isPromptingUserToSelectConnectee && G.selectedNode) 
                {
                    if (G.selectedNode === node) return;

                    prompUserToSelectConnectionType
                        (G.selectedNode, node)
                } 
                else 
                {
                    G.selectNode(node)
                }
                render()
                return;
            }
        }
        G.isPromptingUserToSelectConnectee = false
        if (G.selectedNode) G.unselectNode()
        render()
    }

    const onmousemove = function(e : MouseEvent) {
        // drag nodes
        const leftClickHeld = e.buttons === 1
        
        if (!leftClickHeld || !G.selectedNode) return;
        const W = canvas.width
        const H = canvas.height
        const node = G.selectedNode
        const [x,y] = [e.clientX, e.clientY]
        const [X,Y] = [node.x*W, node.y*H]
        node.x = x/W
        node.y = y/H
        
        render()
    }

    canvas.onmousedown = onmousedown
    canvas.onmousemove = onmousemove

    return {
        nodeRadius: nodeRadius,
        canvas: canvas,
        ctx: ctx,
        render: render, 
    }
})()

function prompUserToSelectConnectionType(
    node1 : NuniGraphNode, node2 : NuniGraphNode) {
    if (node2.id === 0) {
        /* 
            No prompt neede, in this case. We'll make it easy for the user
            and only allow channel connections to the master gain node. If they 
            oscillate the gain of it, they wont be able to lower the volume 
            of the entire graph through the node's intrinsic gain value, anymore.
        */
       G.connect(node1, node2, 'channel')
       G.isPromptingUserToSelectConnectee = false
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
            G.isPromptingUserToSelectConnectee = false
            GraphCanvas.render()
        }
        prompt.appendChild(btn)
    }
}
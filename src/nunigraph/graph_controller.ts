






class NuniGraphController {
/**
 *  Manipulates the graph and its' view
 */

    private g : NuniGraph
    private nodeValueContainer : HTMLElement   // belongs in view
    private connectionTypePrompt : HTMLElement // belongs in view
    renderer : NuniGraphRenderer
    selectedNode? : NuniGraphNode
    private mouseIsDown : boolean
    selectedNodes : NuniGraphNode[]
    private lastMouseDownMsg : any
    private selectionStart? : [number,number]
    private copiedNodes? : string

    constructor (
        g : NuniGraph, 
        container : HTMLElement, 
        prompt : HTMLElement, 
        renderer : NuniGraphRenderer ) {

        this.g = g
        this.nodeValueContainer = container
        this.connectionTypePrompt = prompt
        this.renderer = renderer
        this.mouseIsDown = false
        this.selectedNodes = []
        
        const mouse_move = (e : MouseEvent) => {
            const { x: offsetX, y: offsetY } = this.getMousePos(e)
            const msg = { 
                buttons: e.buttons, offsetX, offsetY 
                } as MouseEvent
            this.mousemove(msg) 
        }

        renderer.canvas.onmousedown = e => this.mousedown(e)
        window.addEventListener('mousemove', e => mouse_move(e))
        window.addEventListener('mouseup', e => this.mouseup(e))
        window.addEventListener('keydown', e => this.keydown(e))
    }

    private getMousePos(e : MouseEvent) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    selectNode (node : NuniGraphNode) {
        this.selectedNode = node
        this.toggleValuesWindow()
    }

    unselectNode() {
        this.selectedNode = undefined
        this.toggleValuesWindow()
    }

    // Inject (or hide) HTML that allows manipulation of the selected node
    toggleValuesWindow() {
        const { nodeValueContainer: container, 
            connectionTypePrompt: prompt, 
            selectedNode: node } = this

        container.classList.toggle('show', node != undefined)
        if (!node) return;

        container.innerHTML = ''
        const controls = E('div')
        
        container.appendChild(createDraggableTopBar(
            `${node.type.toUpperCase()}, id: ${node.id}`))

        controls.appendChild(showSubtypes(node))

        if (node.audioNode instanceof BufferNode2) {
            controls.appendChild(samplerControls(node.audioNode))
        }

        if (node.audioNode instanceof NuniSourceNode) {
            controls.appendChild(activateKeyboardButton(node.audioNode))
        }

        controls.appendChild(exposeAudioParams(node))

        // Add delete button, but not if id is 0, because that's the master gain.
        if (node.id !== 0) { 
            const deleteNode = E('button')
            deleteNode.innerText = 'delete this node'
            deleteNode.style.float = 'right'
            deleteNode.onclick = _ => {  
    
                /** If this prompt stays open then connections 
                 *  to deleted nodes become possible, and the 
                 *  program blows up if you try to do that. 
                 * */ 
                prompt.classList.remove('show')
    
                UndoRedoModule.save()
                this.g.deleteNode(node)
                this.unselectNode()
                this.renderer.render()
            }
            controls.append(deleteNode)
        }
        container.appendChild(controls)
    }
    
    private getNodesInBox(x : number, y : number) {
        const { width: W, height: H } = this.renderer.canvas
        if (!this.mouseIsDown) {
            return this.selectedNodes
        }
        if (this.selectionStart) {
            const [X,Y] = this.selectionStart
            return this.selectedNodes = 
            this.g.nodes.filter(node => {
                const [ax, bx] = [x!, X].sort((a,b)=>a-b)
                const [ay, by] = [y!, Y].sort((a,b)=>a-b)
                const isInside = (nx : number, ny : number) => 
                    ax < nx && nx < bx && 
                    ay < ny && ny < by

                return isInside(node.x*W, node.y*H)
            })
        }
        if (this.selectedNodes.length) {
            return this.selectedNodes
        }
        return []
    }

    private mousedown(e : MouseEvent) {
        
        hideGraphContextmenu()
        this.mouseIsDown = true
        
        const { type, id, node } = 
            this.lastMouseDownMsg = 
            this.renderer.getGraphMouseTarget(e)

        if (this.selectedNodes && node) {
            const nodes = this.selectedNodes
            // this is all about keeping those nodes in the canvas
            // while being dragged.
            const o = {
                top:    nodes.reduce((a,node) => Math.max(a,node.y), -Infinity),
                bottom: nodes.reduce((a,node) => Math.min(a,node.y), Infinity),
                left:   nodes.reduce((a,node) => Math.min(a,node.x), Infinity),
                right:  nodes.reduce((a,node) => Math.max(a,node.x), -Infinity),
                }
            this.lastMouseDownMsg.bounds = {
                U: o.top - node!.y,
                D: node!.y - o.bottom,
                L: node!.x - o.left,
                R: o.right - node!.x
                }
        }

        ;({
            [HOVER.SELECT]: () => {
                UndoRedoModule.save() // A node will probably be moved, here.
                if (this.selectedNodes.includes(node!)) return;
                this.selectedNodes = []
                this.selectNode(node!)
                this.renderer.render()
            },

            [HOVER.EDGE]: () => {
                if (this.selectedNodes.includes(node!)) return;
                this.selectedNodes = []
                this.unselectNode()
                this.renderer.fromNode = node!
            },

            [HOVER.CONNECTION]: () => { 
                this.selectedNodes = []

                const cache = this.renderer.connectionsCache
                const { fromId, toId, connectionType } = cache[id!]

                UndoRedoModule.save()
                this.unselectNode()
                this.renderer.fromNode = 
                    this.g.nodes.find(node => node.id === fromId)!
                const to = 
                    this.g.nodes.find(node => node.id === toId)!
                delete cache[id!]

                this.g.disconnect(this.renderer.fromNode, to, connectionType)
            },

            [HOVER.EMPTY]: () => {
                this.selectedNodes = []

                this.unselectNode()
                const { x, y } = this.getMousePos(e)
                this.selectionStart = [x, y]
                this.renderer.render()
            }
        })[type as HOVER]()
    }

    private mousemove(e : MouseEvent) {

        const snode = this.selectedNode
        const isPressing = 
            e.buttons === 1 && 
            this.mouseIsDown

        const { type, id, node } = this.renderer.getGraphMouseTarget(e)
        const { width: W, height: H } = this.renderer.canvas
        const { selectedNodes } = this

        if (!this.selectionStart && // A selection is not currently being made
            selectedNodes.length && // A group of nodes is selected
            isPressing) {           // The user is pressing
                
            const { 
                node, 
                bounds: { U, D, L, R } 
                } = this.lastMouseDownMsg
            
            // Don't let any node in the 
            // group of selected nodes
            // leave the canvas.
            const _x = node.x
            const _y = node.y 
            const _dx = e.offsetX / W - _x
            const _dy = e.offsetY / H - _y
            node.x = clamp(L, _x + _dx, 1-R)
            node.y = clamp(D, _y + _dy, 1-U)
            const dx = node.x - _x
            const dy = node.y - _y

            for (const n of selectedNodes) {
                if (n === node) continue
                n.x += dx
                n.y += dy
            }
        }

        if (isPressing && snode && !selectedNodes.length) {
            // Drag the selected node
            snode.x = clamp(0, e.offsetX/W, 1)
            snode.y = clamp(0, e.offsetY/H, 1)
        }

        const options = {
            x: e.offsetX, 
            y: e.offsetY,
            buttons: e.buttons,
            hover_type: type, 
            hover_id: node ? node.id : id,
            selectionStart: this.selectionStart,
            selectedNodes: this.getNodesInBox(e.offsetX, e.offsetY)
            }

        this.renderer.render(options)
    }

    private mouseup(e : MouseEvent) {
        
        this.mouseIsDown = false
        this.selectionStart = undefined

        const { renderer, selectedNodes } = this

        const fromNode = renderer.fromNode
        if (!fromNode) return;

        const { type, id, node } = renderer.getGraphMouseTarget(e)

        if (node === fromNode) {
            renderer.fromNode = null
            renderer.render()
            return;
        }


        const do_it = () =>
            this.promptUserToSelectConnectionType(
                fromNode, 
                node!,
                e.offsetX,
                e.offsetY)
            
        ;(<Indexed>{
            [HOVER.EDGE]:       () => do_it(),
            [HOVER.SELECT]:     () => do_it(),
            [HOVER.CONNECTION]: () => {},
            [HOVER.EMPTY]:      () => {}
        })[type]()

        renderer.fromNode = null
        renderer.render({ selectedNodes })
    }

    private keydown(e : KeyboardEvent) {
        if (UndoRedoModule.tryInput(e)) {
            this.renderer.render()
        }
        log('e =',e)
        if (e.keyCode === 46) {
            UndoRedoModule.save()
            if (this.selectedNode) {
                this.g.deleteNode(this.selectedNode)
            }
            for (const node of this.selectedNodes) {
                if (node.id !== 0) {
                    this.g.deleteNode(node)
                }
            }
            this.selectedNode = undefined
            this.selectedNodes = []
            this.renderer.render()
        }
        if (e.ctrlKey && e.keyCode === 86) { // ctrl + V
            UndoRedoModule.save()

            if (this.selectedNode)
                this.selectedNode = this.g.copyNodes([this.selectedNode])[0]

            this.selectedNodes = 
                this.g.copyNodes(this.selectedNodes)

            this.renderer.render({ 
                selectedNodes: this.selectedNodes,
                selectedNode: this.selectedNode
                })
        }
    }

    private promptUserToSelectConnectionType(
        node1 : NuniGraphNode, node2 : NuniGraphNode, x : number, y : number) {
        
        const { renderer } = this

        if (node2.id === 0) {
            // No prompt needed in this case. 
            // Only allow channel connections to the master gain node.
            // Allowing connections to someGain.gain can prevent it from being muted.
            UndoRedoModule.save()
            this.g.connect(node1, node2, 'channel')
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
            btn.innerText = param
            btn.onclick = () =>
            {
                UndoRedoModule.save()
                this.g.connect(node1, node2, param)
                prompt.classList.remove('show')
                renderer.render()
            }
            prompt.appendChild(btn)
        }
        const cancel = E('button')
        cancel.innerText = 'cancel'
        cancel.classList.add('connection-button')
        cancel.onclick = () => prompt.classList.remove('show')
        prompt.appendChild(cancel)

        // Place the prompt in an accessible location
        UI_clamp(x, y + 40, prompt, renderer.canvas)
    }
}
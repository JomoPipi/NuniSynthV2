






class NuniGraphController {
/**
 *  Manipulates the graph and its' view
 */

    private g : NuniGraph
    private nodeValueContainer : HTMLElement   // belongs in view
    private connectionTypePrompt : HTMLElement // belongs in view
    renderer : NuniGraphRenderer
    selectedNode : NuniGraphNode | null
    private mouseIsDown : boolean

    constructor (
        g : NuniGraph, 
        container : HTMLElement, 
        prompt : HTMLElement, 
        renderer : NuniGraphRenderer ) {

        this.g = g
        this.nodeValueContainer = container
        this.connectionTypePrompt = prompt
        this.renderer = renderer
        this.selectedNode = null
        this.mouseIsDown = false

        const mouse_move = (e : MouseEvent) => {
            const { x: offsetX, y: offsetY } = getMousePos(e)
            const msg = { 
                buttons: e.buttons, offsetX, offsetY 
                } as MouseEvent
            this.mousemove(msg) 
        }
        function getMousePos(e : MouseEvent) {
            const rect = renderer.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            }
        }

        renderer.canvas.onmousedown = (e : MouseEvent) => {
            this.mousedown(e)
        }

        window.addEventListener('mousemove', e => mouse_move(e))

        renderer.canvas.onmouseup = (e : MouseEvent) => {
            this.mouseup(e)
            // window.removeEventListener('mousemove', mousemove)
        }
    }

    selectNode (node : NuniGraphNode) {
        this.selectedNode = node
        this.toggleValuesWindow()
    }

    unselectNode() {
        this.selectedNode = null
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

    private mousedown(e : MouseEvent) {
        this.mouseIsDown = true
        
        const { type, id, node } = this.renderer.getGraphMouseTarget(e)

        ;(<Indexed>{
            [HOVER.SELECT]: () => {
                this.selectNode(node!)
                this.renderer.render()
            },
            [HOVER.EDGE]: () => {
                this.unselectNode()
                this.renderer.fromNode = node!
            },
            [HOVER.CONNECTION]: () => { 
                const cache = <Indexed>this.renderer.connectionsCache
            
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
            [HOVER.EMPTY]: () => this.unselectNode()
        })[type]()
    }

    private mousemove(e : MouseEvent) {

        const snode = this.selectedNode

        const isPressing = 
            e.buttons === 1 && 
            this.mouseIsDown

        if (isPressing && snode) {
            // Drag the selected node
            const { width: W, height: H } = this.renderer.canvas
            snode.x = clamp(0, e.offsetX/W, 1)
            snode.y = clamp(0, e.offsetY/H, 1)
        }

        const { type, id, node } = this.renderer.getGraphMouseTarget(e)

        const options = {
            x: e.offsetX, 
            y: e.offsetY,
            buttons: e.buttons,
            hover_type: type, 
            hover_id: node ? node.id : id
            }

        this.renderer.render(options)
    }

    private mouseup(e : MouseEvent) {
        this.mouseIsDown = false

        const { renderer } = this
        const fromNode = renderer.fromNode
        if (!fromNode) return;

        const { type, id, node } = renderer.getGraphMouseTarget(e)

        if (node === fromNode) {
            renderer.fromNode = null
            renderer.render()
            return;
        }

        const { offsetX: x, offsetY: y } = e

        const do_it = () =>
            this.promptUserToSelectConnectionType(fromNode, node!, x, y)
            
        ;(<Indexed>{
            [HOVER.EDGE]:       () => do_it(),
            [HOVER.SELECT]:     () => do_it(),
            [HOVER.CONNECTION]: () => 0,
            [HOVER.EMPTY]:      () => 0
        })[type]()

        renderer.fromNode = null
        renderer.render()
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
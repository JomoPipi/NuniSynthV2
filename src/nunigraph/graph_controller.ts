






class NuniGraphController {
/**
 *  Manipulates the graph and its' view
 */

    g : NuniGraph
    nodeValueContainer : HTMLElement   // belongs in view
    connectionTypePrompt : HTMLElement // belongs in view
    renderer : NuniGraphRenderer
    selectedNode : NuniGraphNode | null
    mouseIsDown : boolean

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

        renderer.canvas.onmousedown = (e : MouseEvent) => this.mousedown(e)
        renderer.canvas.onmousemove = (e : MouseEvent) => this.mousemove(e)
        renderer.canvas.onmouseup   = (e : MouseEvent) => this.mouseup(e)
    }

    selectNode (node : NuniGraphNode) {
        this.selectedNode = node
        this.selectNodeFunc()
    }

    unselectNode() {
        this.selectedNode = null
        this.selectNodeFunc()
    }

    // Inject (or hide) HTML that allows manipulation of the selected node
    selectNodeFunc () {
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
                this.renderer.render() // Has to be generalized, as well.
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

        const node = this.selectedNode
        
        const isPressing = 
            e.buttons === 1 && 
            this.mouseIsDown

        if (isPressing && node) {
            // Drag the selected node
            const { width: W, height: H } = this.renderer.canvas
            node.x = e.offsetX/W
            node.y = e.offsetY/H
        }

        this.renderer.render(e)
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
            [HOVER.CONNECTION]: () => do_it(),
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
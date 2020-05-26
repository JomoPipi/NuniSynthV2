






import { GraphUndoRedoModule } from './graph_undo_redo.js'
import { NuniGraph } from './nunigraph.js'
import { NuniGraphRenderer } from './graph_renderer.js'
import { HOVER } from './graph_renderer.js'
import { NuniGraphNode } from './nunigraph_node.js'
import { BufferNode2 } from '../webaudio2/buffer2.js'
import { NuniSourceNode } from '../webaudio2/nuni_source_node.js'
import { hideGraphContextmenu } from './graph_handlers.js'
import { showSubtypes, 
    activateKeyboardButton, 
    samplerControls, 
    exposeAudioParams, 
    createValuesWindow 
    } from './display_nodedata/display_nodedata.js'
import { SubgraphSequencer } from '../webaudio2/sequencers/subgraph-sequencer.js'
import { G } from './init.js'

export class NuniGraphController {
/**
 *  Manipulates the graph and its' view
 */

    private g : NuniGraph
    private connectionTypePrompt : HTMLElement // belongs in view
    renderer : NuniGraphRenderer
    selectedNode? : NuniGraphNode
    private mouseIsDown : boolean
    selectedNodes : NuniGraphNode[]
    private lastMouseDownMsg : any
    private selectionStart? : [number,number]
    openWindow : Indexable<HTMLElement> // [node.id]:nodeValuesWindow
    private copiedNodes? : string

    constructor (
        g : NuniGraph, 
        prompt : HTMLElement, 
        renderer : NuniGraphRenderer ) {

        this.g = g
        this.connectionTypePrompt = prompt
        this.renderer = renderer
        this.mouseIsDown = false
        this.selectedNodes = []
        this.openWindow = {}
        
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
        this.unselectNode()
        this.selectedNode = node
        this.showValuesWindow(node)
        this.openWindow[node.id].classList.add('selected2')
    }

    unselectNode() {
        this.selectedNode = undefined
        for (const key in this.openWindow) {
            this.openWindow[key].classList.remove('selected2')
        }
    }

    closeWindow(node : NuniGraphNode) {
        const window = this.openWindow[node.id]
        if (window) {
            D('nunigraph-stuff')!.removeChild(window)
            delete this.openWindow[node.id]
        }
    }

    deleteNode(node : NuniGraphNode) {
        this.connectionTypePrompt.classList.remove('show')
        this.closeWindow(node)
        this.g.deleteNode(node)
        this.unselectNode()
        this.selectedNodes = []
        this.renderer.render()
    }

    private showValuesWindow(node : NuniGraphNode) {
        if (this.openWindow[node.id]) return;

        const moveContainerToTop = (box : HTMLElement) => {
            let max = -Infinity
            for (const key in this.openWindow) {
                const zi = +this.openWindow[key].style.zIndex
                max = Math.max(max, zi)
            }
            box.style.zIndex = (max+1).toString()
        }

        const clickCallback = (box : HTMLElement) => {
            moveContainerToTop(box)
            this.selectNode(node)
            this.renderer.render()
        }

        const closeCallback = () => {
            this.closeWindow(node)
        }

        const deleteCallBack = () => {  
            GraphUndoRedoModule.save()
            this.deleteNode(node)
        }

        const container =
            createDraggableWindow({
                text: `${node.type.toUpperCase()}, id: ${node.id}`,
                clickCallback,
                closeCallback,
                color: node.id === 0 
                    ? MasterGainColor 
                    : NodeTypeColors[node.type]
                })

        this.openWindow[node.id] = container

        container.appendChild(
            createValuesWindow(
                node, 
                deleteCallBack))
        
        D('nunigraph-stuff')!.appendChild(container)
        moveContainerToTop(container)
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
                GraphUndoRedoModule.save() // A node will probably be moved, here.
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

                GraphUndoRedoModule.save()
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
        if (GraphUndoRedoModule.tryInput(e)) {
            this.renderer.render()
        }
        
        if (e.keyCode === 46) {
            if (this.selectedNode) {
                GraphUndoRedoModule.save()
                this.deleteNode(this.selectedNode)
            }
            if (this.selectedNodes.length) {
                GraphUndoRedoModule.save()
            }
            for (const node of this.selectedNodes) {
                if (node.id !== 0) {
                    this.deleteNode(node)
                }
            }
        }

        if (e.ctrlKey && e.keyCode === 86) { // ctrl + V
            GraphUndoRedoModule.save()

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

        if (node2.id === 0 || node2.type === NodeTypes.SGS) {
            // No prompt needed in this case. 
            // Only allow channel connections to the master gain node.
            // Allowing connections to someGain.gain can prevent it from being muted.
            GraphUndoRedoModule.save()
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
                GraphUndoRedoModule.save()
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
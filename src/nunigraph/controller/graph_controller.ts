






// import { UndoRedoModule } from '../../helpers/simple_undo_redo.js'
import { NuniGraphRenderer, HOVER } from '../view/graph_renderer.js'
import { NuniGraphAudioNode } from '../../webaudio2/internal.js'
import { NuniGraphNode } from '../model/nunigraph_node.js'
import { NuniGraph } from '../model/nunigraph.js'
import { clipboard } from './clipboard.js'
import { createDraggableWindow, UI_clamp } from '../../UI_library/internal.js'

export const ActiveControllers = [] as NuniGraphController[]

type CreateValuesWindow = (
    node : NuniGraphNode, 
    saveCallback : Function, 
    deleteCallBack : Function) => HTMLElement

type DeleteNodeOptions = {
    force? : boolean
    noRender? : boolean
    }

let openWindowGlobalIndexThatKeepsRising = 0

export class NuniGraphController {
/**
 *  Manipulates the graph and its' view
 */

    g : NuniGraph
    private connectionTypePrompt : HTMLElement // belongs in view
    renderer : NuniGraphRenderer
    private mouseIsDown : boolean
    private selectedNodes : NuniGraphNode[]
    private lastMouse_DownMsg : { type : HOVER } & Indexed // { bounds? : Indexed }
    private lastMouse_MoveMsg : { type : HOVER } & Indexed
    private selectionStart? : [number,number]
    getOpenWindow : Indexable<HTMLElement> // [node.id]:nodeValuesWindow
    private lastCoordsOfWindow : Indexable<[number,number]>
    // private undoRedoModule : UndoRedoModule
    private createValuesWindow : CreateValuesWindow
    // private copiedNodes? : string

    // we need this variable in order to be able to tell if
    // we should toggle the dialog box or not.
    private mouseHasMovedSinceLastMouseDown : boolean

    // THIS IS NEEDED TO CHECK IF THE MOUSE ACTUALLY MOVED
    //  BECAUSE CHROME FIRES A MOUSEMOVE EVENT
    // WHEN CLICKING IN FULLSCREEN FOR SOME REASON.
    private lastMouse_DownXY : [number,number]

    private _keydown : (e : KeyboardEvent) => void
    private _mouseup : (e : MouseEvent) => void
    private _mouse_move : (e : MouseEvent) => void

    constructor (
        g : NuniGraph, 
        prompt : HTMLElement, 
        renderer : NuniGraphRenderer,
        createValuesWindow : CreateValuesWindow) {

        this.g = g
        this.connectionTypePrompt = prompt
        this.renderer = renderer
        // this.undoRedoModule = new UndoRedoModule(
        //     () => this.g.toRawString(),
        //     (state : string) => this.g.fromRawString(state))
        this.createValuesWindow = createValuesWindow

        this.mouseIsDown = false
        this.selectedNodes = []
        this.lastMouse_MoveMsg = 
            this.lastMouse_DownMsg = 
            { type: HOVER.EMPTY }
        this.getOpenWindow = {}
        this.lastCoordsOfWindow = {}

        this.mouseHasMovedSinceLastMouseDown = false
        this.lastMouse_DownXY = [0,0]
            
        this._mouse_move = (e : MouseEvent) => {
            const { x: offsetX, y: offsetY } = this.getMousePos(e)
            const msg = 
                { buttons: e.buttons
                , offsetX
                , offsetY 
                } as MouseEvent
            this.mousemove(msg) 
        }
        this._mouseup = (e : MouseEvent) => this.mouseup(e)
        this._keydown = (e : KeyboardEvent) => this.keydown(e)
    }




    fromString(graphCode : string) {
        for (const id in this.renderer.connectionsCache) 
        {
            delete this.renderer.connectionsCache[id]
        }
        this.g.fromString(graphCode)
    }




    activateEventHandlers() {
        window.addEventListener('mousemove',    this._mouse_move)
        window.addEventListener('mouseup',      this._mouseup)
        window.addEventListener('keydown',      this._keydown)
        this.renderer.canvas.onmousedown = e => this.mousedown(e)

        // Right-click options
        this.renderer.canvas.oncontextmenu = (e : MouseEvent) => {
            e.preventDefault()
            this.showContextMenu(e.clientX, e.clientY)
        }
    }



    
    deactivateEventHandlers() {
        window.removeEventListener('mousemove', this._mouse_move)
        window.removeEventListener('mouseup',   this._mouseup)
        window.removeEventListener('keydown',   this._keydown)
        this.renderer.canvas.onmousedown = null
        this.renderer.canvas.oncontextmenu = null
    }




    save() {
        // this.undoRedoModule.save()
    }
    undo() {
        // this.undoRedoModule.undo()
    }
    redo() {
        // this.undoRedoModule.redo()
    }




    showContextMenu(x : number, y : number) {

        DIRTYGLOBALS.lastControllerToOpenTheContextmenu = this

        const menu = D('graph-contextmenu')
    
        menu.style.zIndex = (openWindowGlobalIndexThatKeepsRising + 1).toString()
        menu.style.display = 'grid'
        UI_clamp(x, y, menu, document.body, { topLeft: true })
    }




    hideContextMenu() {
        D('graph-contextmenu').style.display = 'none'
    }




    private getMousePos(e : MouseEvent) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const obj = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
        return obj
    }




    selectNode (node : NuniGraphNode) {
        this.unselectNodes()

        this.selectedNodes = [node]
        this.getOpenWindow[node.id]?.classList.add('selected2')
    }




    unselectNodes() {
        this.selectedNodes = []
        for (const key in this.getOpenWindow) 
        {
            this.getOpenWindow[key].classList.remove('selected2')
        }
    }




    closeAllWindows() {
        for (const nodeId in this.getOpenWindow) 
        {
            this.closeWindow(+nodeId)
        }
    }




    deleteNode(node : NuniGraphNode, options = {} as DeleteNodeOptions) {
        
        const { force, noRender } = options

        // The `force` parameter was added because of a requirement of NuniGraph.pasteNodes
        if (!force && node.INPUT_NODE_ID) return; // This can only be deleted from its' outer scope.
        
        this.connectionTypePrompt.classList.remove('show')
        this.closeWindow(node.id)
        this.renderer.removeFromConnectionsCache(node.id)
        this.g.deleteNode(node)
        this.unselectNodes()
        this.selectedNodes = []

        if (!noRender) 
        {
            this.renderer.render()
        }
    }




    private openWindow(node : NuniGraphNode) {

        const moveTheWindowToTheTop = (box : HTMLElement) => {
            box.style.zIndex = (++openWindowGlobalIndexThatKeepsRising).toString()
        }

        if (this.getOpenWindow[node.id]) 
        {
            moveTheWindowToTheTop(this.getOpenWindow[node.id])
            return;
        }



        // CUSTOM NODE STUFF - make it an active controller
        if (node.audioNode instanceof NuniGraphAudioNode) 
        {
            const controller = node.audioNode.controller
            if (ActiveControllers.includes(controller)) throw 'This shouldn\'t have happened'
            ActiveControllers.push(controller)
            node.audioNode.activateWindow()
        }




        const clickCallback = (box : HTMLElement) => {
            moveTheWindowToTheTop(box)

            if (node.type !== NodeTypes.CUSTOM) 
            {
                this.selectNode(node)
            }
            this.renderer.render({ selectedNodes: [node] })
        }

        const closeCallback = () => {
            this.closeWindow(node.id)
        }

        const deleteCallBack = () => {  
            this.save()
            this.deleteNode(node)
        }

        const titleEditor = () => {
            const input = E('input', 
                { className: 'title-editor'
                , props: 
                    { value: node.title || ''
                    , size: 10
                    }
                })

            input.oninput = () => {
                node.title = input.value
                this.renderer.render()
            }
            return input
        }

        const dialogBox =
            createDraggableWindow(
                { text: `${NodeLabel[node.type]}, id: ${node.id}`
                , clickCallback
                , closeCallback
                , color: node.id === 0 
                    ? MasterGainColor 
                    : NodeTypeColors[node.type]
                , barContent: node.INPUT_NODE_ID || node.id === 0 // Allow titles for all (except certain) nodes
                // , barContent: node.type !== NodeTypes.CUSTOM // Allow titles only for modules
                    ? undefined
                    : titleEditor()
                })


        this.getOpenWindow[node.id] = dialogBox

        dialogBox.children[1].appendChild(
            this.createValuesWindow(
                node, 
                () => this.save(),
                deleteCallBack))
        
        D('node-windows').appendChild(dialogBox)
        moveTheWindowToTheTop(dialogBox)

        if (node.id in this.lastCoordsOfWindow) 
        {
            const [x,y] = this.lastCoordsOfWindow[node.id]
            dialogBox.style.left = x + 'px'
            dialogBox.style.top  = y + 'px'
        }
        else
        {
            // Place it close the node
            const canvas = this.renderer.canvas
            const { left, top } = canvas.getBoundingClientRect()
            const placeUnder = node.y < .3 ? -1 : 1
            UI_clamp(
                node.x * canvas.offsetWidth + left,
                node.y * canvas.offsetHeight + top - dialogBox.offsetHeight * placeUnder,
                dialogBox,
                document.body)
        }
    }




    private closeWindow(id : number) {

        const node = this.g.nodes.find(({ id: _id }) => _id === id)!
        if (!node) throw 'figure out what to do from here'
        if (node.audioNode instanceof NuniGraphAudioNode) 
        {
            const controller = node.audioNode.controller
            const index = ActiveControllers.indexOf(controller)
            if (index >= 0) 
            {
                ActiveControllers.splice(index, 1)
                node.audioNode.deactivateWindow()
            }
        }

        const nodeWindow = this.getOpenWindow[id]
        if (nodeWindow) 
        {
            this.lastCoordsOfWindow[id] = [nodeWindow.offsetLeft, nodeWindow.offsetTop]
            D('node-windows').removeChild(nodeWindow)
            delete this.getOpenWindow[id]
        }
    }




    private getNodesInBox(x : number, y : number) {
        const { width: W, height: H } = this.renderer.canvas
        if (!this.mouseIsDown) 
        {
            return this.selectedNodes
        }
        if (this.selectionStart) 
        {
            const [X,Y] = this.selectionStart
            return this.selectedNodes = 
            this.g.nodes.filter(node => {
                const [startX, endX] = [x!, X].sort((a,b)=>a-b)
                const [startY, endY] = [y!, Y].sort((a,b)=>a-b)
                const isInside = (nodeX : number, nodeY : number) => 
                    startX < nodeX && nodeX < endX && 
                    startY < nodeY && nodeY < endY

                return isInside(node.x*W, node.y*H)
            })
        }
        return this.selectedNodes
    }




    private toggleDialogBox(node : NuniGraphNode) {
        if (!this.getOpenWindow[node.id]) 
        {
            this.openWindow(node)
            this.getOpenWindow[node.id].classList.add('selected2')
        }
        else 
        {
            this.closeWindow(node.id)
        }
    }




    private mousedown(e : MouseEvent) {
        
        this.mouseHasMovedSinceLastMouseDown = false

        this.hideContextMenu()
        this.mouseIsDown = true
        
        const hoverMsg = 
            this.lastMouse_DownMsg = 
            this.renderer.getGraphMouseTarget(e)
        const { id, node } = hoverMsg

        this.lastMouse_DownXY = [e.offsetX, e.offsetY]

        if ((hoverMsg.type === HOVER.EDGE || hoverMsg.type === HOVER.SELECT) 
            && this.selectedNodes.includes(hoverMsg.node))
        {
            const nodes = this.selectedNodes

            // this is all about keeping those 
            // selected nodes inside the canvas
            // while being dragged.
            const o = 
                { top:    nodes.reduce((a,node) => Math.max(a,node.y), 0)
                , bottom: nodes.reduce((a,node) => Math.min(a,node.y), 1)
                , left:   nodes.reduce((a,node) => Math.min(a,node.x), 1)
                , right:  nodes.reduce((a,node) => Math.max(a,node.x), 0)
                }

            this.lastMouse_DownMsg.bounds = 
                { U: o.top - node!.y
                , D: node!.y - o.bottom
                , L: node!.x - o.left
                , R: o.right - node!.x
                }
        }
        
        ;({
            
            [HOVER.SELECT]: () => {
                this.save() // A node will probably be moved, here.
                if (this.selectedNodes.includes(node!)) return;
                this.selectNode(node!)
                this.renderer.render({ selectedNodes: [node] })
            },

            [HOVER.EDGE]: () => {
                this.selectedNodes = []
                this.unselectNodes()
                if (HasNoOutput[node!.type]) return;
                this.renderer.fromNode = node!
            },

            [HOVER.CONNECTION]: () => { 
            
                this.selectedNodes = []
                
                const cache = this.renderer.connectionsCache
                const { fromId, toId, connectionType } = cache[id!]

                this.save()
                this.unselectNodes()

                this.renderer.fromNode = 
                    this.g.nodes.find(node => node.id === fromId)!

                const to = 
                    this.g.nodes.find(node => node.id === toId)!

                delete cache[id!]

                // We have to close this inputNode's window if it's open.
                if (to.audioNode instanceof NuniGraphAudioNode) 
                {

                    const inputNode 
                        = to.audioNode.controller.g.nodes.find(node =>
                            node.INPUT_NODE_ID?.id === fromId)

                    if (!inputNode) throw 'error, this should be here'

                    to.audioNode.controller.closeWindow(
                        inputNode.id)
                }

                this.g.disconnect(this.renderer.fromNode, to, connectionType)
            },

            [HOVER.EMPTY]: () => {
                this.selectedNodes = []

                this.unselectNodes()
                const { x, y } = this.getMousePos(e)
                this.selectionStart = [x, y]
                this.renderer.render()
            }

        })[hoverMsg.type]()

        
        const deselectNodesOfOtherGraphs = () => {
            for (const controller of ActiveControllers) 
            {
                if (controller !== this) 
                {
                    controller.unselectNodes()
                    controller.renderer.render()
                }
            }
        }
        deselectNodesOfOtherGraphs()
    }




    private mousemove(e : MouseEvent) {

        const [x,y] = this.lastMouse_DownXY

        // FULLSCREEEN ADD AN EXTRA MOUSEMOVE EVENT, AND FUCKS WITH THE COORDINATES >:(
        if (Math.abs(x - e.offsetX) > 1 || Math.abs(y - e.offsetY) > 1) 
        {
            this.mouseHasMovedSinceLastMouseDown = true
        }

        const isPressing = 
            e.buttons === 1 && this.mouseIsDown

        const msg = this.renderer.getGraphMouseTarget(e)
        const { width: W, height: H } = this.renderer.canvas
        const { selectedNodes } = this

        if (!this.selectionStart    // A selection is not currently being made
            && selectedNodes.length // A group of nodes is selected
            && isPressing)          // The user is pressing
        {                    
                
            const { node, bounds } = this.lastMouse_DownMsg

            const { U, D, L, R } = bounds || { U: 0, D: 0, L: 0, R: 0 }
            
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

            for (const n of selectedNodes) 
            {
                if (n === node) continue
                n.x += dx
                n.y += dy
            }
        }
        
        // Avoid re-rendering when it's not necessary
        const { type: lastType } = this.lastMouse_MoveMsg
        const { type } = msg
        if (type !== HOVER.SELECT 
            && type !== HOVER.EDGE
            && lastType === type 
            && !this.renderer.fromNode 
            && !isPressing
            && !this.selectionStart) 
        {
            return; 
        }
        this.lastMouse_MoveMsg = msg

        const hover_id = msg.type === HOVER.CONNECTION 
            ? msg.id
            : msg.type !== HOVER.EMPTY
            ? msg.node.id : undefined

        const options = 
            { x: e.offsetX
            , y: e.offsetY
            , buttons: e.buttons
            , hover_type: type
            , hover_id
            , selectionStart: this.selectionStart
            , selectedNodes: this.getNodesInBox(e.offsetX, e.offsetY)
            }

        this.renderer.render(options)
    }




    private mouseup(e : MouseEvent) {

        // Ctrl + click
        if (e.ctrlKey && e.target === this.renderer.canvas) 
        {
            const X = e.offsetX / this.renderer.canvas.width
            const Y = e.offsetY / this.renderer.canvas.height

            this.selectedNodes = 
                this.g.pasteNodes(X, Y, clipboard.nodes, clipboard.connections)

            this.renderer.render(this)
        }
        
        this.mouseIsDown = false
        this.selectionStart = undefined

        const { renderer, selectedNodes } = this
        const fromNode = renderer.fromNode
        const msg = renderer.getGraphMouseTarget(e)

        if (!fromNode) 
        {
            if (!this.mouseHasMovedSinceLastMouseDown 
                && (msg.type === HOVER.SELECT || msg.type === HOVER.EDGE) 
                && msg.node === this.lastMouse_DownMsg.node) 
            {
                this.toggleDialogBox(msg.node)
            }
            renderer.render({ selectedNodes })
            return;
        }

        if (msg.node === fromNode) 
        {
            renderer.fromNode = null
            renderer.render()
            return;
        }


        const do_it = () =>
            this.promptUserToSelectConnectionType(
                fromNode, 
                msg.node!,
                e.clientX,
                e.clientY)

        const render = () => renderer.render({ selectedNodes })

        renderer.fromNode = null

        ;(
            { [HOVER.EDGE]:       do_it
            , [HOVER.SELECT]:     do_it
            , [HOVER.CONNECTION]: render
            , [HOVER.EMPTY]:      render
            }
        )[msg.type]()
    }




    private keydown(e : KeyboardEvent) {
        // undo/redo with keyboard disabled, for now
        // if (this.undoRedoModule.tryInput(e)) 
        // {

        //     // SGS doesn't support window staying open throughout undo/redo
        //     this.closeAllWindows()

            // // Close the ones that shouldn't be there anymore
            // // const IDs = new Set(this.g.nodes.map(node => node.id))
            // // for (const nodeId in this.getOpenWindow) 
            // // {
            // //     if (!IDs.has(+nodeId)) 
            // //     {
            // //         this.closeWindow(+nodeId)
            //  //     }
            // // }
        //     this.renderer.render()
        // }

        // for (const { audioNode } of this.g.nodes) 
        // {
        //     if (audioNode instanceof NuniGraphAudioNode && 
        //         audioNode.windowIsOpen &&
        //         audioNode.controller.selectedNodes.length > 0) {
            
        //         // Don't do mouse events here
        //         return; 
        //     }
        // }
        
        // 46 for Windows, 8 for Apple
        if (e.keyCode === 46 || (ISMAC && e.keyCode === 8)) 
        {
            if (this.selectedNodes.length) 
            {
                this.save()
                for (const node of this.selectedNodes) 
                {
                    if (node.id !== 0) 
                    {
                        this.deleteNode(node)
                    }
                }
            }
        }

        else if (e.ctrlKey && e.keyCode === 83) 
        { // ctrl + s : node reproduction function

            const nodesToCopy = 
                this.selectedNodes.filter(node => !node.INPUT_NODE_ID)
                
            if (nodesToCopy.length === 0) return;
            
            this.save()

            this.selectedNodes = 
                this.g.reproduceNodesAndConnections(nodesToCopy)

            this.renderer.render(this)

            if (this.selectedNodes.length === 1) 
            {
                this.openWindow(this.selectedNodes[0])
            }
        }

        else if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 88)) 
        { // Do the ctrl + c/x copy function

            const nodesToCopy = 
                this.selectedNodes.filter(node => !node.INPUT_NODE_ID)

            if (nodesToCopy.length === 0) return;

            clipboard.nodes = nodesToCopy.map(this.g.convertNodeToNodeSettings)
            clipboard.connections = nodesToCopy.map(node => {
                const connectionList = []
                for (const { id, connectionType } of this.g.oneWayConnections[node.id] || []) 
                {
                    const index = nodesToCopy.findIndex(node => node.id === id)
                    if (index >= 0) 
                    {
                        connectionList.push({ id: index, connectionType })
                    } 
                }
                return connectionList
            })

            if (e.keyCode === 67) 
            {
                // Copy - flash the copied nodes
                requestAnimationFrame(() => {
                    this.renderer.render()

                    requestAnimationFrame(() => {
                        this.renderer.render({ selectedNodes: nodesToCopy })
                    })
                })
            }
            else if (e.keyCode === 88) 
            { 
                // Cut - delete nodes
                for (const node of nodesToCopy) 
                {
                    if (node.id !== 0) 
                    {
                        this.deleteNode(node, { noRender: true })
                    }
                }
                this.renderer.render()
            }
        }
    }




    private promptUserToSelectConnectionType(
        node1 : NuniGraphNode, node2 : NuniGraphNode, x : number, y : number) {

        const { renderer } = this

        const makeConnection = (destination : ConnectionType) => {
            this.save()
            this.g.makeConnection(node1, node2, destination)
            renderer.render()
            
            if (OpensDialogBoxWhenConnectedTo[node2.type]) 
            {
                this.openWindow(node2)
            }
        }

        const types = (
            SupportsInputChannels[node2.type] 
            ? ['channel'] 
            : []
            ).concat(AudioNodeParams[node2.type]) as ConnectionType[]

        if (node2.id === 0 || types.length === 1) 
        {
            // No prompt needed in this case. 
            // Only allow channel connections to the master gain node.
            // Allowing connections to someGain.gain can prevent it from being muted.
            makeConnection(types[0])
            return;
        }

        this.deactivateEventHandlers()
        
        const prompt = D('connection-type-prompt')
        const hide_it = () => {
            prompt.classList.remove('show-grid')
            this.activateEventHandlers()
        }

        prompt.classList.add('show-grid')
        prompt.innerHTML= ''
        prompt.style.zIndex = Number.MAX_SAFE_INTEGER.toString()

        for (const param of types as ConnectionType[]) 
        {
            const btn = E('button', { text: param, className: 'connection-type-button' })
            btn.style.borderColor = ConnectionTypeColors[param]
            btn.onclick = () =>
            {
                hide_it()
                makeConnection(param)
            }
            prompt.appendChild(btn)
        }

        const cancel = E('button', 
            { text: 'cancel'
            , className: 'connection-type-button'
            })
        cancel.onclick = hide_it
        prompt.appendChild(cancel)

        const w = prompt.offsetWidth
        const _x = renderer.canvas.width/2 + renderer.canvas.offsetLeft
        // Place the prompt in an accessible location
        UI_clamp(
            x > _x ? x - w : x + w,
            y + 40, 
            prompt,
            document.body)
    }
}
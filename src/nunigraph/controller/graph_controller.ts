






import { NuniGraphRenderer, HOVER } from '../view/graph_renderer.js'
import { NuniGraphAudioNode } from '../../webaudio2/internal.js'
import { NuniGraphNode } from '../model/nunigraph_node.js'
import { NuniGraph } from '../model/nunigraph.js'
import { clipboard } from './clipboard.js'
import { UI_clamp, createDraggableWindow } from '../../UI_library/internal.js'
import { createValuesWindow } from '../view/display_nodedata.js'
import { createSelectionPrompt } from '../../UI_library/components/selection_prompt.js'
import { contextmenu, addModuleToList } from './graph_contextmenu.js'
import { createSVGIcon } from '../../UI_library/components/svg_icon.js'

export const OpenGraphControllers = {
    list: [] as NuniGraphController[],
    render() {
        for (const controller of this.list)
        {
            controller.renderer.render()
        }
    }
}

type DeleteNodeOptions = {
    force? : boolean
    noRender? : boolean
    }

const dialogBoxesContainer = D('node-windows')

const is
    = <T extends NodeTypes>(node : NuniGraphNode, type : T) 
    : node is NuniGraphNode<T> => node.type === type

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
    lastNodeWindowPosition : Record<number, [number,number]>
    // private undoRedoModule : UndoRedoModule
    // private copiedNodes? : string

    // We need this variable in order to be able to tell if
    // we should toggle the dialog box or not.
    private mouseHasMovedSinceLastMouseDown : boolean

    // THIS IS NEEDED TO CHECK IF THE MOUSE ACTUALLY MOVED
    //  BECAUSE CHROME FIRES A MOUSEMOVE EVENT
    // WHEN CLICKING IN FULLSCREEN FOR SOME REASON.
    private lastMouse_DownXY : [number,number]

    private _keydown : (e : KeyboardEvent) => void
    private _mouseup : MouseHandler
    private _mouse_move : MouseHandler

    constructor (
        g : NuniGraph, 
        prompt : HTMLElement, 
        renderer : NuniGraphRenderer,
        // createValuesWindow : CreateValuesWindow
        ) {

        this.g = g
        this.connectionTypePrompt = prompt
        this.renderer = renderer
        // this.undoRedoModule = new UndoRedoModule(
        //     () => this.g.toRawString(),
        //     (state : string) => this.g.fromRawString(state))
        // this.createValuesWindow = createValuesWindow

        this.mouseIsDown = false
        this.selectedNodes = []
        this.lastMouse_MoveMsg = 
            this.lastMouse_DownMsg = 
            { type: HOVER.EMPTY }
        this.getOpenWindow = {}
        this.lastNodeWindowPosition = {}

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
        this.renderer.clearConnectionsCache()
        this.g.fromString(graphCode)
    }




    activateEventHandlers() {
        window.addEventListener('mousemove',    this._mouse_move)
        window.addEventListener('mouseup',      this._mouseup)
        window.addEventListener('keydown',      this._keydown)
        this.renderer.canvas.onmousedown = e => this.mousedown(e)

        // Right-click options
        this.renderer.canvas.oncontextmenu = (e : MouseEvent) => {
            if (e.buttons === 1) return;
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




    hideContextMenu() {
        contextmenu.style.display = 'none'
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
        this.getOpenWindow[node.id]?.classList.add('selected3')
    }




    private unselectNodes() {
        this.selectedNodes = []
        for (const key in this.getOpenWindow) 
        {
            this.getOpenWindow[key].classList.remove('selected3')
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

        // See if there's any modules that this node is connected to..
        for (const { id } of this.g.oneWayConnections[node.id] || [])
        {
            const moduleNode = this.g.nodes.find(node => 
                node.id === id && node.type === NodeTypes.MODULE
                ) as NuniGraphNode<NodeTypes.MODULE>

            if (moduleNode)
            {
                // We have to close this inputNode's window if it's open.
                const inputNode 
                    = moduleNode.audioNode.controller.g.nodes.find(_node => 
                        _node.INPUT_NODE_ID?.id === node.id)
                
                if (!inputNode) throw 'error: this should be here'

                moduleNode.audioNode.controller.closeWindow(inputNode.id)
            }
        }
        
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




    private getNodesInBox(x : number, y : number) {
        const { width: W, height: H } = this.renderer.canvas

        if (!this.mouseIsDown || !this.selectionStart) 
        {
            return this.selectedNodes
        }

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




    private toggleDialogBox(node : NuniGraphNode) {
        if (!this.getOpenWindow[node.id]) 
        {
            this.openWindow(node)
            this.getOpenWindow[node.id].classList.add('selected3')
        }
        else 
        {
            this.closeWindow(node.id)
        }
    }
    
    openWindow(node : NuniGraphNode) {
        if (!SelectWhenDialogBoxIsClicked[node.type])
        {
            this.unselectNodes()
        }

        // If window is already open, move it to the top
        if (this.getOpenWindow[node.id])
        {
            moveTheWindowToTheTop(this.getOpenWindow[node.id], node)
            return;
        }

        const nodeIdentifier = E('span', 
            { className: 'margin-4'
            , text: 'ᴵᴰ ' + node.id.toString() 
            })

        const barContent = E('span',
            { className: 'bar-content'
            , children: 
                [ createSVGIcon(DefaultNodeIcon[node.type])
                , nodeIdentifier
                ].concat(node.INPUT_NODE_ID || !HasTitleEditor[node.type]
                    ? []
                    : [titleEditor()])
            })


        if (is(node, NodeTypes.MODULE))
        {
            // Mark the controller as 'active'
            const controller = node.audioNode.controller
            if (OpenGraphControllers.list.includes(controller)) throw `graph_controller.ts - this shouldn't have happened`
            OpenGraphControllers.list.push(controller)
            node.audioNode.activateWindow()

            // Add a button for additional options
            const gearButton = E('button', 
            { text: '⚙️'
            , className: 'push-button'
            , props:
                { onclick: () => {
                    const prompt = createSelectionPrompt([ 'Save Module', 'Cancel' ])
                    barContent.appendChild(prompt)
                    // prompt.style.margin = '50px -20px'

                    // Delay this or it will register on the same click
                    requestAnimationFrame(_ =>
                        window.addEventListener('click', (e : MouseEvent) => {
                            const [ saveModule ] = prompt.children
                            if (e.target === saveModule)
                            {
                                addModuleToList(
                                    node.title || 'Untitled',
                                    node.audioNode.controller.g.toString())
                            }
                            barContent.removeChild(barContent.lastElementChild!)
                        }, { once: true }))
                    }
                }
            })
            barContent.appendChild(gearButton)
        }

        // Create dialogBox:
        const contentContainer = E('div')//, { className: 'full' })
        const dialogBox = createDraggableWindow(
            { clickCallback
            , closeCallback
            , contentContainer
            , color: NodeTypeColors[node.type]
            , barContent
            , resizeUpdate: node.type in HasAResizableDialogBox
                ? (H, W) => (node as NuniGraphNode<HasAResizableDialogBox>).audioNode.updateBoxDimensions(H, W)
                : undefined
            })

        // dialogBox.style.border = '2px solid purple'
        this.getOpenWindow[node.id] = dialogBox

        contentContainer.appendChild(
            createValuesWindow(
                node, 
                () => this.save(),
                deleteCallBack,
                dialogBox))

        dialogBoxesContainer.appendChild(dialogBox)

        // Place diaglogBox:
        moveTheWindowToTheTop(dialogBox, node)
        if (this.lastNodeWindowPosition[node.id]) 
        {
            // Place it where it was:
            const [x,y] = this.lastNodeWindowPosition[node.id]
            dialogBox.style.left = x + 'px'
            dialogBox.style.top  = y + 'px'
        }
        else
        {
            // Place it close to the node:
            const canvas = this.renderer.canvas
            const { left, top } = canvas.getBoundingClientRect()
            const placeUnder = node.y < .3 ? -1 : 1
            UI_clamp(
                node.x * canvas.offsetWidth + left,
                node.y * canvas.offsetHeight + top - dialogBox.offsetHeight * placeUnder,
                dialogBox,
                document.body)
        }


        const _this = this

        function moveTheWindowToTheTop(box : HTMLElement, node : NuniGraphNode) {
            if (!is(node,NodeTypes.MODULE))
            {
                box.style.zIndex = (++DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX).toString()
            }
            else
            {
                const oldzi = +box.style.zIndex
                const newzi = ++DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX
                const delta = newzi - oldzi
                box.style.zIndex = newzi.toString()
                const openChildWindow = node.audioNode.controller.getOpenWindow
                for (const id in openChildWindow)
                {
                    const newzi = +openChildWindow[id].style.zIndex + delta
                    openChildWindow[id].style.zIndex = newzi.toString()
                    DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX = 
                        Math.max(newzi, DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX)
                }
            }
        }

        function closeCallback() {
            _this.closeWindow(node.id)
        }

        function deleteCallBack() {  
            _this.save()
            _this.deleteNode(node)
        }

        function clickCallback(box : HTMLElement) {
            moveTheWindowToTheTop(box, node)

            if (SelectWhenDialogBoxIsClicked[node.type])
            {
                _this.selectNode(node)
            }
            else 
            {
                _this.unselectNodes()
            }
            
            _this.renderer.render({ selectedNodes: [node] })
        }

        function titleEditor() {
            const input = E('input', 
                { className: 'title-editor margin-4 no-drag'
                , props: 
                    { value: node.title || ''
                    , size: 5// 10
                    }
                })

            input.oninput = () => {
                node.title
                = input.value 
                = input.value.replace(/[\/\\\?\%\*\:\|\"\<\>\.\,\;\=]/g, '') // Illegal characters for filename
                _this.renderer.render()
            }
            return input
        }
    }




    closeWindow(id : number) {
        // Closes a node's window if it's open.

        const node = this.g.nodes.find(({ id: _id }) => _id === id)!
        if (!node) throw 'Not supposed to happen - figure out what to do from here'

        const knowsWhenDialogBoxCloses = (node : NuniGraphNode)
            : node is NuniGraphNode<KnowsWhenDialogBoxCloses> =>
            node.type in KnowsWhenDialogBoxCloses

        if (knowsWhenDialogBoxCloses(node)) 
        {
            node.audioNode.deactivateWindow()
        }

        const nodeWindow = this.getOpenWindow[id]
        if (nodeWindow) 
        {
            this.lastNodeWindowPosition[id] = [nodeWindow.offsetLeft, nodeWindow.offsetTop]
            dialogBoxesContainer.removeChild(nodeWindow)
            delete this.getOpenWindow[id]
        }
    }




    showContextMenu(x : number, y : number) {

        DIRTYGLOBALS.lastControllerToOpenTheContextmenu = this
        DIRTYGLOBALS.contextmenuRequestPosition = [x, y]

        contextmenu.style.zIndex = (DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX + 1).toString()
        contextmenu.style.display = 'grid'

        // Place the menu in a 
        UI_clamp(x, y, contextmenu, document.body, { smartClamp: true })
    }




    private mousedown(e : MouseEvent) {
        
        this.mouseHasMovedSinceLastMouseDown = false

        this.hideContextMenu()
        this.mouseIsDown = true
        
        const hoverMsg = 
            this.lastMouse_DownMsg = 
            this.renderer.getGraphMouseTarget(e)
        const { connectionId, node } = hoverMsg

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
                const { fromId, toId, connectionType } = cache[connectionId!]
                
                this.save()
                this.unselectNodes()

                this.renderer.fromNode = 
                    this.g.nodes.find(node => node.id === fromId)!

                const to = 
                    this.g.nodes.find(node => node.id === toId)!

                delete cache[connectionId!]

                // We have to close this inputNode's window if it's open.
                if (to.audioNode instanceof NuniGraphAudioNode) 
                {

                    const inputNode 
                        = to.audioNode.controller.g.nodes.find(node =>
                            node.INPUT_NODE_ID?.id === fromId)

                    if (!inputNode) throw 'error, this should be here'

                    to.audioNode.controller.closeWindow(inputNode.id)
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
            for (const controller of OpenGraphControllers.list) 
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
        let showConnectionInsertionMacroLine = false
        
        this.mouseHasMovedSinceLastMouseDown ||=
            (Math.abs(x - e.offsetX) > 1 || Math.abs(y - e.offsetY) > 1)

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
            const marginX = 0.02
            const marginY = marginX * W / H
            node.x = clamp(L + marginX, _x + _dx, 1-R-marginX)
            node.y = clamp(D + marginY, _y + _dy, 1-U-marginY)
            const dx = node.x - _x
            const dy = node.y - _y

            for (const n of selectedNodes) 
            {
                if (n === node) continue
                n.x += dx
                n.y += dy
            }

            showConnectionInsertionMacroLine ||=
                selectedNodes.length === 1 && SupportsInputChannels[selectedNodes[0].type]
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
            ? msg.connectionId
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
            , showConnectionInsertionMacroLine
            }
            
        this.renderer.render(options)
    }




    private mouseup(e : MouseEvent) {

        if (this.renderer.lastDottedLine) 
        {
            if (this.selectedNodes.length !== 1) throw 'Hey. What gives?'

            // We insert the selected node. Output : `connectionType`, input : `channel`.
            const [node] = this.selectedNodes
            const [fromId, toId, connectionType] = this.renderer.lastDottedLine.split(':')

            const fromNode = this.g.nodes.find(({ id }) => id === +fromId)
            const toNode = this.g.nodes.find(({ id }) => id === +toId)

            if (!fromNode || !toNode) throw 'Problem here'
            
            //** - for input-aware nodes, we sneakily rename the represented gain node and change the connections manually...*/
            //? Can it be done the same way for both of those input-aware nodes?
            this.insertNode(node, fromNode, toNode, connectionType as ConnectionType)
        }


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




    insertNode(node : NuniGraphNode, fromNode : NuniGraphNode, toNode : NuniGraphNode, connectionType : ConnectionType) {
        
        this.renderer.clearConnectionsCache()
        this.g.insertNodeIntoConnection(node, fromNode, toNode, connectionType)
        this.renderer.render()
    }




    private keydown(e : KeyboardEvent) {
        // 46 for Windows, 8 for Apple
        if (e.keyCode === 46 || (ISMAC && e.keyCode === 8))
        {   // this.save()
            for (const node of this.selectedNodes) 
            {
                if (node.id !== 0) 
                {
                    this.deleteNode(node)
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

        if (types.length === 1) 
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
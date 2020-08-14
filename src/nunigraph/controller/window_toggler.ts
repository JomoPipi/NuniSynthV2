






import { NuniGraphController, ActiveControllers } from "./graph_controller";
import { NuniGraphNode } from "../model/nunigraph_node";
import { NuniGraphAudioNode } from "../../webaudio2/internal";
import { createDraggableWindow, UI_clamp } from "../../UI_library/internal";
import { createValuesWindow } from "../view/display_nodedata.js";




let openWindowGlobalIndexThatKeepsRising = 0

const lastCoordsOfWindow : Record<number, [number, number]> = {}

export function openWindow(graphController : NuniGraphController, node : NuniGraphNode) {

    const moveTheWindowToTheTop = (box : HTMLElement) => {
        box.style.zIndex = (++openWindowGlobalIndexThatKeepsRising).toString()
    }

    if (graphController.getOpenWindow[node.id]) 
    {
        moveTheWindowToTheTop(graphController.getOpenWindow[node.id])
        return;
    }



    // MODULE NODE STUFF - make it an active controller
    if (node.audioNode instanceof NuniGraphAudioNode) 
    {
        const controller = node.audioNode.controller
        if (ActiveControllers.includes(controller)) throw 'graphController shouldn\'t have happened'
        ActiveControllers.push(controller)
        node.audioNode.activateWindow()
    }




    const clickCallback = (box : HTMLElement) => {
        moveTheWindowToTheTop(box)

        if (node.type !== NodeTypes.MODULE) 
        {
            graphController.selectNode(node)
        }
        graphController.renderer.render({ selectedNodes: [node] })
    }

    const closeCallback = () => {
        closeWindow(graphController, node.id)
    }

    const deleteCallBack = () => {  
        graphController.save()
        graphController.deleteNode(node)
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
            graphController.renderer.render()
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
            // , barContent: node.type !== NodeTypes.MODULE // Allow titles only for modules
                ? undefined
                : titleEditor()
            })


    graphController.getOpenWindow[node.id] = dialogBox

    dialogBox.children[1].appendChild(
        createValuesWindow(
            node, 
            () => graphController.save(),
            deleteCallBack))
    
    D('node-windows').appendChild(dialogBox)
    moveTheWindowToTheTop(dialogBox)

    if (node.id in lastCoordsOfWindow) 
    {
        const [x,y] = lastCoordsOfWindow[node.id]
        dialogBox.style.left = x + 'px'
        dialogBox.style.top  = y + 'px'
    }
    else
    {
        // Place it close the node
        const canvas = graphController.renderer.canvas
        const { left, top } = canvas.getBoundingClientRect()
        const placeUnder = node.y < .3 ? -1 : 1
        UI_clamp(
            node.x * canvas.offsetWidth + left,
            node.y * canvas.offsetHeight + top - dialogBox.offsetHeight * placeUnder,
            dialogBox,
            document.body)
    }
}




export function closeWindow(graphController : NuniGraphController, id : number) {

    const node = graphController.g.nodes.find(({ id: _id }) => _id === id)!
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

    const nodeWindow = graphController.getOpenWindow[id]
    if (nodeWindow) 
    {
        lastCoordsOfWindow[id] = [nodeWindow.offsetLeft, nodeWindow.offsetTop]
        D('node-windows').removeChild(nodeWindow)
        delete graphController.getOpenWindow[id]
    }
}
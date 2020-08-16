






import { GraphController } from '../init.js'



const contextmenu = D('graph-contextmenu')

// Set-up the graph contextmenu
{
    D('nuni-logo').onclick = (e : MouseEvent) =>
        GraphController.showContextMenu(e.pageX, 0)

    const append = (type : NodeTypes, color : string) => {

        const create = (e : MouseEvent) => {

            const controller 
                = (DIRTYGLOBALS.lastControllerToOpenTheContextmenu 
                || GraphController)// as any // as NuniGraphController
            

            controller.save()
            const node = controller.g.createNewNode(type)
            const menu = contextmenu

            if (menu.style.display !== 'none') 
            {
                // Place the newly created node where the contextmenu was.
                const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = 
                    controller === GraphController 
                    ? controller.renderer.canvas
                    : controller.renderer.canvas.parentNode.parentNode.parentNode.parentNode // TODO: clean this line up...

                // ? Using e.pageX and e.pageY instead of contextmenu.offsetLeft/offsetTop
                // ? results in the node being created directly under the cursor. 
                // ? Consult with others to see what they prefer.
                node.x = clamp(0, (contextmenu.offsetLeft - offsetLeft) / offsetWidth, 1)
                node.y = clamp(0, (contextmenu.offsetTop - offsetTop) / offsetHeight, 1)
                controller.hideContextMenu()
            }
            
            controller.renderer.render()
            DIRTYGLOBALS.lastControllerToOpenTheContextmenu = GraphController
        }
        
        const textbox = E('span', { text: NodeLabel[type] })

        const btn = E('button', 
            { className: 'list-btn'
            , children: [textbox]
            , props: { onclick: create }
            })
            btn.style.borderLeft = `4px solid ${color}`

        contextmenu.appendChild(btn)
    }

    for (const key in NodeTypes) 
    {
        if (isNaN(+key)) 
        {
            const type = NodeTypes[key as keyof typeof NodeTypes]
            append(type, NodeTypeColors[type])
        }
    }
}

// Undo / redo buttons
D('graph-undo-redo-btns').onclick = function(e : MouseEvent) {
    const undoBtnId = 'graph-undo-button'
    const redoBtnId = 'graph-redo-button'
    const id = (e.target as HTMLElement).id
    
    if (id === undoBtnId) 
    {
        GraphController.undo()
        GraphController.renderer.render()
    } 
    else if (id === redoBtnId) 
    {
        GraphController.redo()
        GraphController.renderer.render()
    }
}

// Modularize button
export function modularizeGraph() {
    const { g } = GraphController
    const graphCode = g.toString()
    for (const node of [...g.nodes]) 
    {
        if (node.id !== 0) 
        {
            GraphController.deleteNode(node, { noRender: true })
        }
    }

    const node = g.createNewNode(NodeTypes.MODULE, 
        { x: 0.5
        , y: 0.5
        , audioParamValues: {}
        , audioNodeProperties: { graphCode } 
        })
    
    node.audioNode
        .controller
        .g.nodes[0]
        .setValueOfParam('gain', 1)
    
    g.makeConnection(node, g.nodes[0], 'channel')

    GraphController.renderer.render()
}
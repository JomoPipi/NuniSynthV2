






import { GraphController } from '../init.js'
import { NuniGraphController } from './graph_controller.js'
import { LZW_decompress } from '../../helpers/lzw_compression.js'
import { NuniGraphAudioNode } from '../../webaudio2/internal.js'



const contextmenu = D('graph-contextmenu')

// Set-up the graph contextmenu
{
    D('nuni-logo').onclick = (e : MouseEvent) =>
        GraphController.showContextMenu(e.pageX, 0)

    const append = (type : NodeTypes, color : string) => {

        const create = ({ pageX: x, pageY: y } : MouseEvent) => {

            const controller = DIRTYGLOBALS.lastControllerToOpenTheContextmenu || GraphController as NuniGraphController
            

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

                node.x = clamp(0, (x - offsetLeft) / offsetWidth, 1)
                node.y = clamp(0, (y - offsetTop) / offsetHeight, 1)
                controller.hideContextMenu()
            }
            
            controller.renderer.render()
            DIRTYGLOBALS.lastControllerToOpenTheContextmenu = undefined
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
    const id = (<HTMLElement>e.target).id
    
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

    const node = g.createNewNode(NodeTypes.CUSTOM, 
        { x: 0.5
        , y: 0.5
        , audioParamValues: {}
        , audioNodeProperties: { graphCode } 
        })
    
    ;(<NuniGraphAudioNode>node.audioNode)
        .controller
        .g.nodes[0]
        .setValueOfParam('gain', 1)
    
    g.makeConnection(node, g.nodes[0], 'channel')

    GraphController.renderer.render()
}
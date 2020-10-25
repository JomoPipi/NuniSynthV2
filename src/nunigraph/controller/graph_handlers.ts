






import { GraphController } from '../init.js'







// GRAPH UNDO/REDO IS NO MORE
// Undo / redo buttons
// D('graph-undo-redo-btns').onclick = function(e : MouseEvent) {
//     const undoBtnId = 'graph-undo-button'
//     const redoBtnId = 'graph-redo-button'
//     const id = (e.target as HTMLElement).id
    
//     if (id === undoBtnId) 
//     {
//         GraphController.undo()
//         GraphController.renderer.render()
//     } 
//     else if (id === redoBtnId) 
//     {
//         GraphController.redo()
//         GraphController.renderer.render()
//     }
// }

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
        .g.masterGain
        .setValueOfParam('gain', 1)
    
    g.makeConnection(node, g.masterGain, 'channel')

    GraphController.renderer.render()
}
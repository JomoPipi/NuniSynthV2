






import { GraphController } from '../init.js'

// Modularize button
export function modularizeGraph() {
    const { g } = GraphController
    if (g.nodes.length < 3) 
    {
        // TODO: Notification Box
        alert/*sendNotificationBox*/('You need at least 3 nodes in your graph to do this.')
        return;
    }
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
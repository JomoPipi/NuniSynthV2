import { GraphController } from '../init.js';
const contextmenu = D('graph-contextmenu');
{
    D('nuni-logo').onclick = (e) => GraphController.showContextMenu(e.pageX, 0);
    const append = (type, color) => {
        const create = (e) => {
            const controller = DIRTYGLOBALS.lastControllerToOpenTheContextmenu || GraphController;
            controller.save();
            const node = controller.g.createNewNode(type);
            const menu = contextmenu;
            if (menu.style.display !== 'none') {
                const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = controller === GraphController
                    ? controller.renderer.canvas
                    : controller.renderer.canvas.parentNode.parentNode.parentNode.parentNode;
                node.x = clamp(0, (contextmenu.offsetLeft - offsetLeft) / offsetWidth, 1);
                node.y = clamp(0, (contextmenu.offsetTop - offsetTop) / offsetHeight, 1);
                controller.hideContextMenu();
            }
            controller.renderer.render();
            DIRTYGLOBALS.lastControllerToOpenTheContextmenu = undefined;
        };
        const textbox = E('span', { text: NodeLabel[type] });
        const btn = E('button', { className: 'list-btn',
            children: [textbox],
            props: { onclick: create }
        });
        btn.style.borderLeft = `4px solid ${color}`;
        contextmenu.appendChild(btn);
    };
    for (const key in NodeTypes) {
        if (isNaN(+key)) {
            const type = NodeTypes[key];
            append(type, NodeTypeColors[type]);
        }
    }
}
D('graph-undo-redo-btns').onclick = function (e) {
    const undoBtnId = 'graph-undo-button';
    const redoBtnId = 'graph-redo-button';
    const id = e.target.id;
    if (id === undoBtnId) {
        GraphController.undo();
        GraphController.renderer.render();
    }
    else if (id === redoBtnId) {
        GraphController.redo();
        GraphController.renderer.render();
    }
};
export function modularizeGraph() {
    const { g } = GraphController;
    const graphCode = g.toString();
    for (const node of [...g.nodes]) {
        if (node.id !== 0) {
            GraphController.deleteNode(node, { noRender: true });
        }
    }
    const node = g.createNewNode(NodeTypes.CUSTOM, { x: 0.5,
        y: 0.5,
        audioParamValues: {},
        audioNodeProperties: { graphCode }
    });
    node.audioNode
        .controller
        .g.nodes[0]
        .setValueOfParam('gain', 1);
    g.makeConnection(node, g.nodes[0], 'channel');
    GraphController.renderer.render();
}
//# sourceMappingURL=graph_handlers.js.map
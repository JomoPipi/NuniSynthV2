import { GraphController } from '../init.js';
const contextmenu = D('graph-contextmenu');
{
    D('nuni-logo').onclick = (e) => GraphController.showContextMenu(e.clientX, e.clientY);
    const append = (type, color) => {
        const create = () => {
            const controller = DIRTYGLOBALS.lastControllerToOpenTheContextmenu || GraphController;
            controller.save();
            const node = controller.g.createNewNode(type);
            const menu = contextmenu;
            if (menu.style.display !== 'none') {
                const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = controller === GraphController
                    ? controller.renderer.canvas
                    : controller.renderer.canvas.parentNode.parentNode.parentNode.parentNode;
                node.x = clamp(0, (menu.offsetLeft - offsetLeft + menu.offsetWidth / 2.0) / offsetWidth, 1);
                node.y = clamp(0, (menu.offsetTop - offsetTop + menu.offsetHeight / 2.0) / offsetHeight, 1);
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
//# sourceMappingURL=graph_handlers.js.map
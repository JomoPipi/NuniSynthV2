import { applyStyle } from "../../UI_library/internal.js";
export function createResizeableGraphEditor(audioNode) {
    const box = E('div');
    const { canvas } = audioNode;
    const topRow = E('div', { className: 'full' });
    const bottomRow = E('div', { className: 'full' });
    const dragCorner = E('span', {
        className: 'corner-drag-box'
    });
    applyStyle(topRow, {
        height: '10px'
    });
    bottomRow.appendChild(dragCorner);
    let start_xy = [], wh = [];
    function mousedown(e) {
        start_xy = [e.clientX, e.clientY];
        wh = [canvas.offsetWidth, canvas.offsetHeight];
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    }
    function mousemove(e) {
        const [X, Y] = [e.clientX, e.clientY];
        const [x, y] = start_xy;
        const [w, h] = wh;
        canvas.width = Math.max(0, w + X - x);
        canvas.height = Math.max(0, h + Y - y);
        audioNode.controller.renderer.render();
    }
    function mouseup(e) {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
        start_xy = [];
    }
    dragCorner.onmousedown = mousedown;
    box.append(topRow, canvas, bottomRow);
    requestAnimationFrame(() => audioNode.controller.renderer.render());
    return box;
}
//# sourceMappingURL=resizeable_graph_editor.js.map
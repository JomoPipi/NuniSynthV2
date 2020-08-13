import { rgbaColorContrast } from "../functions/colorContrast.js";
import { UI_clamp } from "../functions/ui_clamp.js";
export function createDraggableWindow({ text, clickCallback, closeCallback, color, barContent }) {
    const box = E('div', { className: 'window show' });
    box.style.left = '50vw';
    box.style.top = '50vh';
    const bar = E('div', { text, className: 'draggable-window-bar' });
    const exitBtn = E('button', { text: 'x', className: 'exit-button' });
    bar.style.backgroundColor = color || '#555';
    bar.style.color = rgbaColorContrast(color || '#555');
    box.appendChild(bar);
    if (barContent)
        bar.append(barContent);
    bar.appendChild(exitBtn);
    const closeBox = () => closeCallback(box);
    exitBtn.onclick = closeBox;
    addDragFunction(bar, box, clickCallback);
    box.appendChild(E('div'));
    return box;
}
function addDragFunction(bar, box, clickCallback) {
    let coords = [];
    const mouseup = (e) => {
        coords = [];
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
    };
    const mousedown = function (e) {
        if (e.target === bar) {
            coords =
                [e.clientX,
                    e.clientY,
                    box.offsetLeft + box.offsetWidth / 2,
                    box.offsetTop + box.offsetHeight / 2
                ];
        }
        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
        clickCallback(box);
    };
    const mousemove = function (e) {
        if (coords.length) {
            const [x, y, bx, by] = coords;
            UI_clamp(e.clientX + bx - x, e.clientY + by - y, box, document.body, { disableClamp: 2 });
        }
    };
    box.onmousedown = mousedown;
}
//# sourceMappingURL=draggable_window.js.map
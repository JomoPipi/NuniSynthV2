import { applyStyle } from "../functions/apply_style.js";
import { rgbaColorContrast } from "../functions/colorContrast.js";
import { UI_clamp } from "../functions/ui_clamp.js";
export function createDraggableWindow({ text, clickCallback, closeCallback, color, barContent }) {
    const box = E('div', { className: 'window show' });
    box.style.left = '50vw';
    box.style.top = '50vh';
    const bar = E('div', { text });
    const exitBtn = E('button', { text: 'x' });
    const size = 25;
    const sizePx = `${size}px`;
    box.appendChild(bar);
    applyStyle(bar, { height: sizePx,
        width: '100%',
        background: color || '#555',
        color: rgbaColorContrast(color || '#555'),
        cursor: 'move',
        paddingLeft: '5px',
        boxSizing: 'border-box'
    });
    applyStyle(exitBtn, { cursor: 'pointer',
        border: '0.2px solid #444',
        boxSizing: 'border-box',
        backgroundColor: 'inherit',
        color: 'inherit',
        height: sizePx,
        width: sizePx,
        float: 'right',
        textAlign: 'center',
        lineHeight: sizePx
    });
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
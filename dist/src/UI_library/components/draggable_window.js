"use strict";
function createDraggableWindow({ text, clickCallback, closeCallback, color, content }) {
    const box = E('div', {
        className: 'window show'
    });
    box.style.left = '50vw';
    box.style.top = '50vh';
    const bar = E('div', { text });
    const exitBtn = E('button', { text: 'x' });
    box.appendChild(bar);
    applyStyle(bar, {
        height: '30px',
        width: '100%',
        background: color || '#555',
        color: rgbaColorContrast(color || '#555'),
        cursor: 'move',
        paddingLeft: '5px',
        boxSizing: 'border-box'
    });
    applyStyle(exitBtn, {
        cursor: 'pointer',
        border: '0.2px solid #444',
        boxSizing: 'border-box',
        backgroundColor: 'inherit',
        color: 'inherit',
        height: '30px',
        width: '30px',
        float: 'right',
        textAlign: 'center',
        lineHeight: '30px'
    });
    if (content)
        bar.appendChild(content);
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
            coords = [
                e.clientX,
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
            UI_clamp(e.clientX + bx - x, e.clientY + by - y, box, document.body);
        }
    };
    box.onmousedown = mousedown;
}
//# sourceMappingURL=draggable_window.js.map
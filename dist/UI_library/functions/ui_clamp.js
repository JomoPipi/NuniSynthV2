const UP = 1, DOWN = 2, LEFT = 4, RIGHT = 8;
export function UI_clamp(x, y, element, container, options = {}) {
    const [w, h, W, H, dx, dy] = [element.offsetWidth + 2,
        element.offsetHeight + 2,
        container.offsetWidth,
        container.offsetHeight,
        container.offsetLeft,
        container.offsetTop
    ];
    const [X, Y] = options.topLeft
        ? [x, y]
        : [x - w / 2 + dx, y - h / 2 + dy];
    const disable = options.disableClamp || 0;
    const minX = disable & LEFT ? -Infinity : dx;
    const minY = disable & UP ? -Infinity : dy;
    const maxX = disable & RIGHT ? Infinity : W - w + dx;
    const maxY = disable & DOWN ? Infinity : H - h + dy;
    element.style.left =
        clamp(minX, X, maxX) + 'px';
    element.style.top =
        clamp(minY, Y, maxY) + 'px';
}
//# sourceMappingURL=ui_clamp.js.map
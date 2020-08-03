const UP = 1, DOWN = 2, LEFT = 4, RIGHT = 8;
export function UI_clamp(x, y, element, container, options = {}) {
    const { topLeft } = options;
    const disabled = options.disableClamp || 0;
    const [w, h, W, H, dx, dy] = [
        element.offsetWidth + 2,
        element.offsetHeight + 2,
        container.offsetWidth,
        container.offsetHeight,
        container.offsetLeft,
        container.offsetTop,
    ];
    const [X, Y] = topLeft
        ? [x, y]
        : [x - w / 2 + dx, y - h / 2 + dy];
    const minX = disabled & LEFT ? -Infinity : dx;
    const minY = disabled & UP ? -Infinity : dy;
    const maxX = disabled & RIGHT ? Infinity : W - w + dx;
    const maxY = disabled & DOWN ? Infinity : H - h + dy;
    element.style.left =
        clamp(minX, X, maxX) + 'px';
    element.style.top =
        clamp(minY, Y, maxY) + 'px';
}
//# sourceMappingURL=ui_clamp.js.map
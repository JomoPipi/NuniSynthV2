"use strict";
function rgbaColorContrast(rgba) {
    const [r, g, b] = rgba.slice(rgba.indexOf('(') + 1, rgba.indexOf(')')).split(',').slice(0, 3).map(x => +x.trim());
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? 'black'
        : 'white';
}
//# sourceMappingURL=colorContrast.js.map







export function createSVGIcon(key : SVGIconKey, size? : number) {
    const img = E('img', { className: 'svg-image side-margin-4' })
        img.draggable = false
        img.dataset.svgkey = key
        img.src = `svg_images/${key}.svg`
        img.width = 
        img.height = size || 16
    return img
}
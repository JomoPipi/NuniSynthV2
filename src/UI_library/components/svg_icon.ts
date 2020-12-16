






export function createSVGIcon(key : GraphIconKey) {
//     const container = E('span')

    const img = E('img', { className: 'svg-image margin-4' })
    img.draggable = false
    img.src = `images/${key}.svg`
    img.width = 
    img.height = 16
    // container.appendChild(img)

    // {
    // const img = E('img', { className: 'svg-image' })
    // img.draggable = false
    // img.src = `images/volume.svg`
    // img.style.backgroundColor = 'cyan'
    // img.width = 
    // img.height = 16
    // container.appendChild(img)
    // }
    return img
}
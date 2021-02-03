






// export function rgbaColorContrast(rgba: string) {
//     if (!rgba) return ''
//     const [r,g,b] = 
//         rgba.slice(
//             rgba.indexOf('(')+1,
//             rgba.indexOf(')')
//             ).split(',').slice(0,3).map(x=>+x.trim())

//     // http://stackoverflow.com/a/3943023/112731
//     return (r * 0.299 + g * 0.787 + b * 0.114) > 186
//         ? 'black'
//         : 'white'
// }

export function mixRGB(c1 : string, c2 : string, weight = .5) {

    const [r1,g1,b1] = c1.split(',').map(s => +s.replace(/[^0-9]/g,''))
    const [r2,g2,b2] = c2.split(',').map(s => +s.replace(/[^0-9]/g,''))
    
    const r = Math.floor(r2 + (r1 - r2) * weight)
    const g = Math.floor(g2 + (g1 - g2) * weight)
    const b = Math.floor(b2 + (b1 - b2) * weight)

    return `rgb(${r},${g},${b})`
}
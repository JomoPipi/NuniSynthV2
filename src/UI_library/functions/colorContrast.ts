






export function rgbaColorContrast(rgba: string) {
    const [r,g,b] = 
        rgba.slice(
            rgba.indexOf('(')+1,
            rgba.indexOf(')')
            ).split(',').slice(0,3).map(x=>+x.trim())

    // http://stackoverflow.com/a/3943023/112731
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186
        ? 'black'
        : 'white'
}
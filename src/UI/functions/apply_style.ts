






const applyStyle = (e : HTMLElement, style : Indexed) => {
    for (const attr in style) {
        (<Indexed>e.style)[attr] = style[attr]
    }
}
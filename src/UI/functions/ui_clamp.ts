






function UI_clamp(
    x : number, 
    y : number, 
    element : HTMLElement,
    container : HTMLElement) {
    /**
     * Moves the element to (x,y) while
     * staying inside the container.
     */

    const [w, h, W, H] = [
        element.offsetWidth+1, 
        element.offsetHeight+1,
        container.offsetWidth, 
        container.offsetHeight
        ]

    element.style.left = 
        clamp(0, x - w/2, W-w) + 'px'

    element.style.top = 
        clamp(0, y - h/2, H-h) + 'px'
}
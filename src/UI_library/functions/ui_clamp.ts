






export function UI_clamp(
    x : number, y : number, element : HTMLElement, container : HTMLElement) {
    /**
     * Moves the element to (x,y) while
     * staying inside the container.
     */

    const [w, h, W, H, dx, dy] = [
        element.offsetWidth+2, 
        element.offsetHeight+2,
        container.offsetWidth, 
        container.offsetHeight,
        container.offsetLeft,
        container.offsetTop,
        ]
        
    element.style.left = 
        clamp(dx, x-w/2+dx, W-w+dx) + 'px'

    element.style.top = 
        clamp(dy, y-h/2+dy, H-h+dy) + 'px'
}
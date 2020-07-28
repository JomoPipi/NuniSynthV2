






type ClampOptions = {
    topLeft? : boolean
    }

export function UI_clamp(
    x : number, y : number, 
    element : HTMLElement, 
    container : HTMLElement,
    options : ClampOptions = {}) {

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
    
    const [X, Y] = options.topLeft 
        ? [x, y]
        : [x-w/2+dx, y-h/2+dy]

    element.style.left = 
        clamp(dx, X, W-w+dx) + 'px'

    element.style.top = 
        clamp(dy, Y, H-h+dy) + 'px'
}
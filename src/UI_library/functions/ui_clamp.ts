






type ClampOptions = {
    smartClamp? : boolean
    disableClamp? : 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15
    }

const UP = 1, DOWN = 2, LEFT = 4, RIGHT = 8

export function UI_clamp(
    x : number, y : number, 
    element : HTMLElement, 
    container : HTMLElement,
    options : ClampOptions = {}) {

    /**
     * Moves the element to (x,y) while
     * staying inside the container.
     */

    const [w, h, W, H, dx, dy] = 
        [ element.offsetWidth+2
        , element.offsetHeight+2
        , container.offsetWidth
        , container.offsetHeight
        , container.offsetLeft
        , container.offsetTop
        ]
    
    const [X, Y] = options.smartClamp 
        ? [x, y]
        : [x-w/2+dx, y-h/2+dy]

    const disable = options.disableClamp || 0
    const minX = disable & LEFT  ? -Infinity : dx
    const minY = disable & UP    ? -Infinity : dy
    const maxX = disable & RIGHT ?  Infinity : W-w+dx
    const maxY = disable & DOWN  ?  Infinity : H-h+dy

    const left = clamp(minX, X, maxX)
    const top = clamp(minY, Y, maxY)

    // smartClamp means copy VSCode way of doing it
    if (options.smartClamp && left >= maxX)
    {
        element.style.left = (X - w) + 'px'
    } 
    else
    {
        element.style.left = left + 'px'
    }
    if (options.smartClamp && top >= maxY)
    {
        element.style.top = (Y - h) + 'px'
    }
    else
    {
        element.style.top = top + 'px'
    }
}







import { doUntilMouseUp } from "../events/until_mouseup.js"






// const myToFixed = (value : number) => 
//     value.toFixed(clamp(0, 3 - Math.ceil(Math.log10(Math.abs(value))), 3))

type Props = {
    min : number,
    max : number
}

export function createDraglineElement<T extends string>(obj : { [key in T] : number }, prop : T, props : Props) {
    // const container = E('span')

    // const percent = E('span', { text: '0.0%', className: 'margin-4' })
    //     percent.style.display = 'inline-block'
    //     percent.style.width = '10px'

    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
        line.classList.add('svg-line')

    const lineContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        lineContainer.classList.add('svg-line-container')
        lineContainer.appendChild(line)

    const W = 50
    const update = (deltaX : number) => {
        const v = obj[prop] = clamp(props.min, obj[prop] + deltaX, props.max)
        // percent.innerText = (v * 100).toFixed(0) + '%'
        line.setAttribute('points', `0,0 ${v * W},0` )
        obj[prop] = v
    }
    update(obj[prop])
    
    const sensitivity = 256
    lineContainer.onmousedown = doUntilMouseUp(
        { mousedown: () => lineContainer.requestPointerLock()
        , mousemove: e => update(e.movementX / sensitivity)
        , mouseup: () => document.exitPointerLock()
        })

    // container.append(lineContainer, percent)
    // container.append(E('div', { text: 'phase' }), lineContainer)
    return lineContainer
}







import { NuniGraphAudioNode } from "../../webaudio2/internal.js"

export function createResizeableGraphEditor(audioNode : NuniGraphAudioNode) {
    const box = E('div')
    
    const { canvas } = audioNode

    const topRow = E('div', { className: 'full' })
    const bottomRow = E('div', { className: 'full' })
    const dragCorner = E('span', { className: 'corner-drag-box' })
        
        // same as corner-drag-box
        topRow.style.height = '10px' // TODO: clean up
    

    bottomRow.appendChild(dragCorner)

    let start_xy = [] as number[], wh = [] as number[]

    function mousedown(e : MouseEvent) {

        start_xy = [e.clientX, e.clientY]
        wh = [canvas.offsetWidth, canvas.offsetHeight]
        window.addEventListener('mousemove', mousemove)
        window.addEventListener('mouseup', mouseup)
    }

    function mousemove(e : MouseEvent) {
        
        const [X,Y] = [e.clientX, e.clientY]
        const [x,y] = start_xy
        const [w,h] = wh
        
        canvas.width = Math.max(0, w + X - x)
        canvas.height = Math.max(0, h + Y - y)

        audioNode.controller.renderer.render()
    }

    function mouseup(e : MouseEvent) {
        
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('mouseup', mouseup)
        start_xy = []
    }
    
    dragCorner.onmousedown = mousedown

    box.append(topRow, canvas, bottomRow)

    // It needs to render after the HTML is appended to the document
    requestAnimationFrame(() => audioNode.controller.renderer.render())

    return box
}
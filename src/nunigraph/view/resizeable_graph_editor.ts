import NuniGraphAudioNode from "../../webaudio2/nunigraph_audionode";







export default function createResizeableGraphEditor(audioNode : NuniGraphAudioNode) {
    const box = E('div')

    const canvas = E('canvas', {
        className: 'nunigraph-canvas--custom',
        })

    const bottomRow = E('div', { className: 'full' })
    const dragCorner = E('span',{
        className: 'corner-drag-box'
        })
        
    applyStyle(dragCorner, {
        backgroundColor: 'black'
        })
    bottomRow.appendChild(dragCorner)

    let xy = [] as number[], wh = [] as number[]

    function mousedown(e : MouseEvent) {
        xy = [e.clientX, e.clientY]
        wh = [canvas.offsetWidth, canvas.offsetHeight]
        window.addEventListener('mousemove', mousemove)
        window.addEventListener('mouseup', mouseup)
    }
    function mousemove(e : MouseEvent) {
        
        const [x,y] = [e.clientX, e.clientY]
        const [X,Y] = xy
        const [w,h] = wh// = [canvas.offsetWidth, canvas.offsetHeight]
        
        canvas.width = Math.max(0, w + x - X)
        canvas.height = trace(Math.max(0, h + y - Y) )
    }
    function mouseup(e : MouseEvent) {
        
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('mouseup', mouseup)
        xy = []
    }
    dragCorner.onmousedown = mousedown

    box.append(canvas,bottomRow)
    return box
}
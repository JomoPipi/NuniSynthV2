import NuniGraphAudioNode from "../../webaudio2/nunigraph_audionode";







export default function createResizeableGraphEditor(audioNode : NuniGraphAudioNode) {
    const box = E('div')
    
    const { canvas } = audioNode

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

        audioNode.controller.renderer.render()
    }
    function mouseup(e : MouseEvent) {
        
        window.removeEventListener('mousemove', mousemove)
        window.removeEventListener('mouseup', mouseup)
        xy = []
    }
    dragCorner.onmousedown = mousedown

    box.append(canvas,bottomRow)

    // It needs to render after the HTML is appended to the document
    setTimeout(() => audioNode.controller.renderer.render(), 5)

    return box
}
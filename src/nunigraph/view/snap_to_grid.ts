






import { ActiveControllers } from "../controller/graph_controller.js"


export const snapToGrid = { isEnabled: false }

const snapToGridBtn = D('snap-to-grid-btn')
snapToGridBtn.onclick = () => {
    snapToGrid.isEnabled = snapToGridBtn.classList.toggle('selected')
    ActiveControllers.forEach(c => c.renderer.render())
}

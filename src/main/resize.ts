






import { GraphController } from '../nunigraph/init.js'

window.addEventListener('resize', resizeHandler)

resizeHandler()

function resizeHandler() {
    GraphController.renderer.render()
}

function resizeKeyboardImage () {
    const keyboard = D('keyboard-image') as HTMLElement & { parentNode : HTMLElement }
    const size = keyboard.parentNode.clientWidth / 60
    keyboard.style.fontSize = size + 'px'
}







window.addEventListener('resize', resizeHandler)

resizeHandler()

function resizeHandler() {
    GraphCanvas.render()
    resizeKeyboard()
}

function resizeKeyboard () {
    const keyboard = D('keyboard-image') as any
    const size = keyboard.parentNode.clientWidth / 180
    keyboard.style.fontSize = size + 'px'
}
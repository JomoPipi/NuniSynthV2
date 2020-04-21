






window.addEventListener('resize', resizeHandler)

resizeHandler()

function resizeHandler() {
    GraphCanvas.render()
    resizeKeyboard()
}







window.addEventListener('resize', resizeHandler)

resizeHandler()

function resizeHandler() {
    GraphController.renderer.render()
    // resizeKeyboard()
}
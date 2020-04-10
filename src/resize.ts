window.addEventListener('resize', resizeHandler)

function resizeHandler() {
    GraphCanvas.render()
    resizeKeyboard()
}

resizeHandler()







D('info-button')!.onclick = () => {
    // window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')\
    D('info-menu')!.classList.toggle('show')
    log('was clicked')
}

D('info-menu-buttons')!.onclick = function(e : MouseEvent) {
    const btns = document.querySelectorAll('.info-menu-button')
    for (const b of btns) {
        // Toggle button styles
        const clicked = e.target === b
        b.classList.toggle(
        'active-info-button', clicked)

        // Toggle info texts
        D(b.innerHTML.trim() + '-info')!
        .classList.toggle(
        'show', clicked)
    }
}
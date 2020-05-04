






D('info-button')!.onclick = () => {
    D('info-menu-container')!.classList.toggle('show')
}

D('info-menu-buttons')!.onclick = function(e : MouseEvent) {
    const btns = document.querySelectorAll('._info-menu-button_')
    for (const b of btns) {
        // Toggle button styles
        const clicked = e.target === b
        b.classList.toggle(
        'active-info-button', clicked)

        // Toggle info texts. There is tight coupling with the HTML, here.
        D(b.innerHTML.trim() + '-info')!
        .classList.toggle(
        'show', clicked)
    }
}
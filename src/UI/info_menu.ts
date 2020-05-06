






{
    const container = D('info-menu-container')!
    const infoBtns = 
        [...document.querySelectorAll('._info-menu-button_')] as
        HTMLButtonElement[]

    D('info-button')!.onclick = () => {
        const showMenu = container.classList.toggle('show')
        container.onclick = showMenu ? clickInsideContainer : null
    }

    function clickInsideContainer(e : MouseEvent) {
        const clickedElement = e.target
        if (clickedElement === container) {
            container.classList.toggle('show')
            return;
        }
        for (const btn of infoBtns) {
            const wasClicked = clickedElement === btn
            const infoTab = D(btn.value)!

            btn.classList.toggle('active-info-button', wasClicked)
    
            infoTab.classList.toggle('show', wasClicked)
        }
    }
}
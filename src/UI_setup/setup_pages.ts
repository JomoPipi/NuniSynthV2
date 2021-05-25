






import { pageGroupify } from "../UI_library/events/page_groupify.js"








pageGroupify(D('scale-kinds'), [
    'preset-library',
    'scale-builder'
    ])


// Set up the info menu
{
    const container = D('info-menu-container')
    const infoBtns = 
        [...document.querySelectorAll('._info-menu-button_')] as HTMLButtonElement[]

    ;(D('info-button').onclick = () => {
        const showMenu = container.classList.toggle('show')
        if (showMenu)
        {
            container.onclick = clickInsideContainer
            container.style.zIndex = 
                (++DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX).toString()
        }
        else
        {
            container.onclick = null
        }
    })()

    function clickInsideContainer(e : MouseEvent) {
        const clickedElement = e.target
        if (clickedElement === container) 
        {
            container.classList.toggle('show')
            return;
        }
        if (!infoBtns.includes(clickedElement as HTMLButtonElement)) 
        {
            return;
        }
        for (const btn of infoBtns) 
        {
            const wasClicked = clickedElement === btn
            const infoTab = D(btn.value)

            btn.classList.toggle('active-info-button', wasClicked)
            infoTab.classList.toggle('show', wasClicked)
        }
    }
}
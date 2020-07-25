






import 
    { openExistingProject
    , saveProjectAs 
    } from '../storage/general/dialog.js'

const menuItemMap =
    { 'Open..': openExistingProject
    , 'Save As..': saveProjectAs
    }

function getNavMenuClickTarget(e : MouseEvent) {
    log('e =',e)
    const target = e.target as HTMLElement
    const text = target.textContent!.trim() as keyof typeof menuItemMap
    log('content ', text)
    menuItemMap[text] && menuItemMap[text]()
}

D('main-nav-menu')!.onclick = getNavMenuClickTarget

export {}
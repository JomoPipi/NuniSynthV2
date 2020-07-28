






import 
    { openExistingProject
    , saveProjectAs 
    , saveProject
    } from '../storage/general/dialog.js'

const menuItemMap =
    { 'Saved Project': openExistingProject
    , 'Save As..': saveProjectAs
    , 'Save': saveProject
    }

function getNavMenuClickTarget(e : MouseEvent) {
    
    const target = e.target as HTMLElement
    const text = target.textContent!.trim() as keyof typeof menuItemMap
    
    menuItemMap[text] && menuItemMap[text]()
}

D('main-nav-menu').onclick = getNavMenuClickTarget

export {}







import 
    { openExistingProject
    , saveProjectAs 
    , saveProject
    } from '../storage/dialog.js'
import { modularizeGraph } from '../nunigraph/controller/graph_handlers.js'
import { setTheme } from './theme_setup.js'

const menuItemMap =
    { 'Saved Project': openExistingProject
    , 'Save As..': saveProjectAs
    , 'Save': saveProject
    , 'Modularize': modularizeGraph
    }

async function getNavMenuClickTarget(e : MouseEvent) {
    
    const target = e.target as HTMLElement
    const text = target.textContent!.trim() as keyof typeof menuItemMap
    
    if (menuItemMap[text]) 
    {
        await menuItemMap[text]()
    }
    else if (text.length && !isNaN(+text))
    {
        setTheme(+text)
    }
}

D('main-nav-menu').onclick = getNavMenuClickTarget

export {}
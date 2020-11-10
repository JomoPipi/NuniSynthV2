






import 
    { openExistingProject
    , saveProjectAs 
    , saveProject
    } from '../storage/dialog.js'
import { modularizeGraph } from '../nunigraph/controller/graph_handlers.js'
import { setTheme } from './theme_setup.js'

const tabs = 
    [ 'graph-tab'
    , 'keyboard-tab'
    , 'buffer-edit-tab'
    , 'waveform-edit-tab'
    ]

const menuItemMap =
    { 'Saved Projects': openExistingProject
    , 'Save As..': saveProjectAs
    , 'Save': saveProject
    , 'Modularize': modularizeGraph
    , 'Main': showTab.bind(null, tabs[0])
    , 'Keyboard': showTab.bind(null, tabs[1])
    , 'Samples': showTab.bind(null, tabs[2])
    , 'Custom Wave': showTab.bind(null, tabs[3])
    }

function getNavMenuClickTarget(e : MouseEvent) {
    
    const target = e.target as HTMLElement
    const text = target.textContent!.trim() as keyof typeof menuItemMap
    
    if (menuItemMap[text]) 
    {
        menuItemMap[text]()
    }
    else if (text.length && !isNaN(+text))
    {
        setTheme(+text)
    }
}

D('main-nav-menu').onclick = getNavMenuClickTarget

export {}

function showTab(name : string) {
    
    for (const tabId of tabs) 
    {
        const page = D(tabId)
        const isTarget = tabId === name
        page.classList.toggle('show', isTarget)
    }
}
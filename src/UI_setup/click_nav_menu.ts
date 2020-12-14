






import 
    { openExistingProject
    , saveProjectAs 
    , saveProject
    } from '../storage/dialog.js'
import { modularizeGraph } from '../nunigraph/controller/modularize_graph.js'
import { setTheme } from './theme_setup.js'
import { UserOptions } from '../storage/user_options.js'
import { ActiveControllers } from '../nunigraph/controller/graph_controller.js'

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
    , 'Config': showConfigWindow
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

function showConfigWindow() {
    const configWindow = E('div', { className: 'window show' })
    for (const key in UserOptions.config)
    {
        const checkBox = E('input')
            checkBox.type = 'checkbox'
            checkBox.checked = (UserOptions.config as any)[key]
        const box = E('span', 
            { text: key
            , children: [checkBox] 
            })
        configWindow.appendChild(box)
        checkBox.oninput = () => {
            (UserOptions.config as any)[key] = checkBox.checked
            ActiveControllers.forEach(controller =>
                controller.renderer.render())
        }
    }

    configWindow.style.zIndex = 
        (++DIRTYGLOBALS.RISING_GLOBAL_Z_INDEX).toString()
        configWindow.style.left = 100 + 'px'
        configWindow.style.top = 100 + 'px'
    
    document.body.appendChild(configWindow)
    const w = configWindow.offsetWidth
    const h = configWindow.offsetHeight

    configWindow.style.marginLeft = `calc(50% - ${w/2}px)`
    configWindow.style.marginTop = `calc(10% - ${h/2}px)`
    configWindow.style.padding = '50px'

    requestAnimationFrame(() =>
    window.addEventListener('click', onclick))

    function onclick(e : Event) {
        if (!configWindow.contains(e.target as any))
        {
            window.removeEventListener('click', onclick)
            document.body.removeChild(configWindow)
            UserOptions.save() // Save config when we click out
        }
    }
}
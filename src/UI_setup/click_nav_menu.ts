






import 
    { openExistingProject
    , saveProjectAs 
    , saveProject
    } from '../storage/dialog.js'
import { modularizeGraph } from '../nunigraph/controller/graph_handlers.js'
import { setTheme } from './theme_setup.js'
import { UserOptions } from '../storage/user_options.js'
import { GraphController } from '../nunigraph/init.js'

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
            GraphController.renderer.render()
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
        }
    }
}

// .info-menu-container {
//     display: none;
//     color: var(--color6);
//     position: absolute;
//     background-color: rgba(0,0,0,0.5);
//     // pointer-events: none;
//     top: 0px;
//     bottom: 0px;
//     left: 0px;
//     right: 0px;
//     text-align: center;
//     z-index: 4;
// }

// .info-menu {
//     border: 3px solid blue;
//     background-color: var(--color0);
//     width: 400px;
//     height: 400px;
//     margin-top: 5%;
//     margin-left: calc(50% - 200px);
// }

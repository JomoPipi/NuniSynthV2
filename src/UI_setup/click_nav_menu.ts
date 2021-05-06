






import 
    { openExistingProject
    , saveProjectAs 
    , saveProject
    } from '../storage/dialog.js'
import { modularizeGraph } from '../nunigraph/controller/modularize_graph.js'
import { Theme } from './theme_setup.js'
import { UserOptions } from '../storage/user_options.js'
import { OpenGraphControllers } from '../nunigraph/controller/graph_controller.js'
import { createRadioButtonGroup } from '../UI_library/internal.js'

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

const partyModeDiv = E('div', { className: 'party-mode' })
function showConfigWindow() {
    const configWindow = E('div', { className: 'window show' })

    {
        const key = 'Show Node Images'
        const checkBox = E('input')
            checkBox.type = 'checkbox'
            checkBox.checked = UserOptions.config[key]
        const box = E('div', 
            { text: key + ' '
            , children: [checkBox] 
            })
        checkBox.oninput = () => {
            UserOptions.config[key] = checkBox.checked
            OpenGraphControllers.render()
        }

        configWindow.appendChild(box)
    }
    
    {
        const key = 'Party Mode'
        const checkBox = E('input')
            checkBox.type = 'checkbox'
            checkBox.checked = UserOptions.config[key]
        const box = E('div', 
            { text: key + ' '
            , children: [checkBox] 
            })
        checkBox.oninput = () => {
            UserOptions.config[key] = checkBox.checked
            setParty(checkBox.checked)
        }

        configWindow.appendChild(box)
    }


    {
        const customTheme = Theme.getCustomTheme()
        const customThemePicker = [...Array(7)].reduce((div, _, i) => {
            const picker = E('input', { className: 'top-bar-btn' })
            picker.type = 'color'
            picker.value = customTheme[i]
            picker.onchange = () => {
                Theme.setCustomThemeColor(i, picker.value)
                UserOptions.config.customTheme = Theme.getCustomTheme()
            }
            div.appendChild(picker)
            return div
            }, E('div', { className: 'selected2 hide' }))
        customThemePicker.style.display = UserOptions.config.theme === 3 ? 'block' : 'none'

        const key = 'theme'
        const btns = createRadioButtonGroup(
            { buttons: ['A','B','C','D']
            , selected: UserOptions.config[key]
            , onclick(_,i) { 
                Theme.set(i)
                OpenGraphControllers.render()

                const showCustom = i === 3
                customThemePicker.style.display = showCustom ? 'block' : 'none'
            } 
            , text: '\nTheme'
            })
            
        configWindow.appendChild(btns)
        configWindow.appendChild(customThemePicker)
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
        if (!configWindow.contains(e.target as HTMLElement))
        {
            window.removeEventListener('click', onclick)
            document.body.removeChild(configWindow)
            console.log('saving!')
            UserOptions.save() // Save config when we click out
        }
    }
}

setParty(UserOptions.config['Party Mode'])

function setParty(yes : boolean) {
    // return;
    if (yes)
    {
        document.body.appendChild(partyModeDiv)
    }
    else if (document.body.contains(partyModeDiv))
    {
        document.body.removeChild(partyModeDiv)
    }
}
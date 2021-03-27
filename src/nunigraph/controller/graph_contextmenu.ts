






import { ModuleStorage } from "../../storage/module_storage.js"
import { createSVGIcon } from "../../UI_library/components/svg_icon.js"
import { GraphController } from "../init.js"
import { NuniGraphNode } from "../model/nunigraph_node.js"
import { nativeModules } from './nativemodules.js'






export const graphContextnenu = D('graph-contextmenu')

D('nuni-logo').onclick = (e : MouseEvent) =>
    GraphController.showContextMenu(e.pageX, 85)

graphContextnenu.onclick = (e : any) => {
    const { createNodeType, moduleName, nativeModuleName } = e.target.dataset

    if (createNodeType)
    {
        createNode(createNodeType, e)
    }
    else if (moduleName)
    {
        const node = createNode(NodeTypes.MODULE, e)
        const graphCode = ModuleStorage.get(moduleName)

        node.audioNode.controller.fromString(graphCode)
        node.title = moduleName
        GraphController.renderer.render()
    }
    else if (nativeModuleName)
    {
        const node = createNode(NodeTypes.MODULE, e)
        const graphCode = nativeModules[nativeModuleName as keyof typeof nativeModules]

        node.audioNode.controller.fromString(graphCode)
        node.title = nativeModuleName
        GraphController.renderer.render()
    }
}




function createNode<T extends NodeTypes>(type : T, e : MouseEvent) : NuniGraphNode<T> {
    const controller 
        = DIRTYGLOBALS.lastControllerToOpenTheContextmenu 
        || GraphController
    
    controller.save()
    const node = controller.g.createNewNode(type)
    const menu = graphContextnenu

    if (menu.style.display !== 'none') 
    { // Place the newly created node under the mouse

        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = 
            controller === GraphController 
            ? controller.renderer.canvas
            : controller.renderer.canvas
                .parentNode.parentNode
                .parentNode.parentNode
                .parentNode // TODO: clean this line up...
        //* This can be fixed by creating the container in the controller and holding a reference to it

        // Where the user clicked to spawn the graphContextnenu:
        const [x, y] = DIRTYGLOBALS.contextmenuRequestPosition
        node.x = clamp(0, (x - offsetLeft) / offsetWidth, 1)
        node.y = clamp(0, (y - offsetTop) / offsetHeight, 1)
        // Where the mouse clicks:
        // node.x = clamp(0, (e.pageX - offsetLeft) / offsetWidth, 1)
        // node.y = clamp(0, (e.pageY - offsetTop) / offsetHeight, 1)
        controller.hideContextMenu()
    }
    
    controller.renderer.render()
    DIRTYGLOBALS.lastControllerToOpenTheContextmenu = GraphController

    return node
}




const contextmenuNodeTypes : NodeTypes[] = 
    [ NodeTypes.GAIN
    , NodeTypes.OSC
    , NodeTypes.SAMPLE
    , NodeTypes.AUTO
    , NodeTypes.S_SEQ
    , NodeTypes.G_SEQ
    , NodeTypes.NUM
    , NodeTypes.FILTER
    , NodeTypes.DELAY
    , NodeTypes.PANNER
    , NodeTypes.SAMPLE_PIANOR
    , NodeTypes.PIANOR
    , NodeTypes.RECORD
    , NodeTypes.MODULE
    , NodeTypes.COMPRESSOR
    , NodeTypes.PROCESSOR
    ]




const userModuleContainer = E('ul', { className: 'module-container' })
const nativeModuleContainer = E('ul', { className: 'module-container' })
const userModuleButton = E('li', 
    { className: 'module-btn'
    , children: 
        [ E('a', 
            { props: { href: '#'
            , text: 'User Modules'
            } })
        , userModuleContainer
        ]
    })
const nativeModuleButton = E('li', 
    { className: 'module-btn'
    , children: 
        [ E('a',
            { props: { href: '#'
            , text: 'Native Modules'
            } })
        , nativeModuleContainer
        ]
    })
const moduleTypeContainer = E('ul', 
    { className: 'module-type-container'
    , children: [userModuleButton, nativeModuleButton]
    })

const toListElement = (data : string) => (name : string) => {
    const element = E('a', 
        { props: { href:'#' }
        , text: name
        })
    element.dataset[data] = name
    return E('li', { children: [element] })
}

const nativeModuleNames = Object.keys(nativeModules).map(toListElement('nativeModuleName'))
nativeModuleContainer.append(...nativeModuleNames)

refreshList()
function refreshList() {
    while (userModuleContainer.lastElementChild)
    {
        userModuleContainer.removeChild(userModuleContainer.lastElementChild)
    }
    const moduleList = ModuleStorage.list().map(toListElement('moduleName'))
    userModuleContainer.append(...moduleList)
}

export function addModuleToList(title : string, graphCode : string) {
    D('wait-cursor').classList.add('show')

    ModuleStorage.set(title, graphCode)
    refreshList()

    setTimeout(() => {
        D('wait-cursor').classList.remove('show')
    }, 500)
}




Fill_The_Context_Menu: {
    const btnList = E('ul', { text: ' Create New Node...' })
    const innerContainer = E('li',  { children: [btnList] })
    const container = E('ul', { children: [innerContainer] })
    graphContextnenu.appendChild(container)
    
    const modulesBtn = E('li', 
        { className: 'contextmenu-btn'
        , children: 
            [ E('a', 
                { props: { href: '#'
                , text: 'Modules'
                } })
            , moduleTypeContainer
            ]
        })
    
    // btnList.appendChild(userModuleButton)
    // btnList.appendChild(nativeModuleButton)
    btnList.appendChild(modulesBtn)
    for (const type of contextmenuNodeTypes)
    {
        const icon = createSVGIcon(DefaultNodeIcon[type], 10)
        const label = E('span', { text: NodeLabel[type] })
        const surface = E('a',
            { children: [icon, label, infoElement(type)]
            , className: 'contextmenu-btn-surface'
            , props: { href: '#' }
            })
        const btn = E('li',
            { className: 'contextmenu-btn'
            , children: [surface] 
            })
    
        surface.dataset.createNodeType = 
        icon.dataset.createNodeType =
        label.dataset.createNodeType = type
        btn.style.borderColor = NodeTypeColors[type]
    
        btnList.appendChild(btn)
    }
    
    function infoElement(type : NodeTypes) {
        
        return E('span', 
            { text: 'i'
            , className: 'tooltip _2'
            
            , children: [E('span',
                { text: NodeTypeDescriptions[type]
                , className: 'tooltiptext'
                })]
            })
    }
}
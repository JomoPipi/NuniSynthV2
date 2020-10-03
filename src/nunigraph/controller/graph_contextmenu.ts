






import { ModuleStorage } from "../../storage/module_storage.js"
import { GraphController } from "../init.js"
import { NuniGraphNode } from "../model/nunigraph_node.js"







export const contextmenu = D('graph-contextmenu')

// D('nuni-logo').onclick = (e : MouseEvent) =>
//     GraphController.showContextMenu(e.pageX, 0)

contextmenu.onclick = (e : any) => {
    const { createNodeType, moduleName } = e.target.dataset

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
}

function createNode<T extends NodeTypes>(type : T, e : MouseEvent) : NuniGraphNode<T> {

    const controller 
        = DIRTYGLOBALS.lastControllerToOpenTheContextmenu 
        || GraphController
    
    controller.save()
    const node = controller.g.createNewNode(type)
    const menu = contextmenu

    if (menu.style.display !== 'none') 
    { // Place the newly created node under the mouse

        const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = 
            controller === GraphController 
            ? controller.renderer.canvas
            : controller.renderer.canvas
                .parentNode.parentNode
                .parentNode.parentNode
                .parentNode // TODO: clean this line up...

        // In the top right corner of the contextmenu?
        // node.x = clamp(0, (contextmenu.offsetLeft - offsetLeft) / offsetWidth, 1)
        // node.y = clamp(0, (contextmenu.offsetTop - offsetTop) / offsetHeight, 1)
        node.x = clamp(0, (e.pageX - offsetLeft) / offsetWidth, 1)
        node.y = clamp(0, (e.pageY - offsetTop) / offsetHeight, 1)
        controller.hideContextMenu()
    }
    
    controller.renderer.render()
    DIRTYGLOBALS.lastControllerToOpenTheContextmenu = GraphController

    return node
}




const nodesSortedByRecurrence = 
    [ NodeTypes.GAIN
    , NodeTypes.OSC
    , NodeTypes.BUFFER
    , NodeTypes.B_SEQ
    , NodeTypes.SGS
    , NodeTypes.CSN
    , NodeTypes.FILTER
    , NodeTypes.DELAY
    , NodeTypes.PANNER
    , NodeTypes.PIANOR
    , NodeTypes.RECORD
    , NodeTypes.MODULE
    , NodeTypes.PROCESSOR
    ]





const moduleContainer = E('ul')
refreshList()

function refreshList() {
    const moduleList = ModuleStorage.list().map(name => {
        const element = E('a', 
            { props: { href:'#' }
            , text: name
            })
        element.dataset.moduleName = name
        return E('li', 
        { children: 
            [ element ]
        })
    })

    while (moduleContainer.lastElementChild)
    {
        moduleContainer.removeChild(moduleContainer.lastElementChild)
    }
    
    moduleContainer.append(...moduleList)
}

export function addModuleToList(title : string, graphCode : string) {
    D('wait-cursor').classList.add('show')

    ModuleStorage.set(title, graphCode)
    refreshList()

    setTimeout(() => {
        D('wait-cursor').classList.remove('show')
    }, 500)
}

// Fill up the menu
const btnList = E('ul', { text: ' Create New Node..' })
const container2 = E('li', { children: [btnList] })
const container = E('ul', { children: [container2] })
contextmenu.appendChild(container)


const modulesBtn = E('li', 
    { className: 'contextmenu-btn'
    , children: 
        [ E('a', 
            { props: { href: '#'
            , text: 'Modules'
            } })
        , moduleContainer
        ]
    })

btnList.appendChild(modulesBtn)
for (const type of nodesSortedByRecurrence) 
{
    const surface = E('a', 
        { text: NodeLabel[type]
        , props: { href: '#' } // <- TODO: ask someone if this is needed
        })
    const btn = E('li',
        { className: 'contextmenu-btn'
        , children: [surface] 
        })

    surface.dataset.createNodeType = type
    btn.style.borderColor = NodeTypeColors[type]

    btnList.appendChild(btn)
}
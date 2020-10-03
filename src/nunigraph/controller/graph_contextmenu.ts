






import { ModuleStorage } from "../../storage/module_storage.js"
import { GraphController } from "../init.js"







export const contextmenu = D('graph-contextmenu')

// D('nuni-logo').onclick = (e : MouseEvent) =>
//     GraphController.showContextMenu(e.pageX, 0)

contextmenu.onclick = (e : any) => {
    if (e.target.dataset.createNodeType)
    {
        createNode(e.target.dataset.createNodeType, e)
    }
}

function createNode(type : NodeTypes, e : MouseEvent) {

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

const btnList = E('ul', { text: ' Create New Node..' })
const container2 = E('li', { children: [btnList] })
const container = E('ul', { children: [container2] })

contextmenu.appendChild(container)

// Fill up the menu
for (const type of nodesSortedByRecurrence) 
{
    const surface = E('a', 
        { text: NodeLabel[type]
        , props: { href: '#' } // <- TODO: ask someone if this is needed
        })
    const btn = E('li', { children: [surface] })

    surface.dataset.createNodeType = type
    btn.style.borderLeft = `2px solid ${NodeTypeColors[type]}`

    btnList.appendChild(btn)
}

// TODO: continue..

const moduleList = [...Array(4)].map((_,i) => 
    E('li', 
    { children: 
        [ E('a', 
            { props: { href:'#' }
            , text: i + 'bla bla bla'
            })
        ]
    }))

const moduleContainer = E('ul', { children: moduleList })

const refreshList = () => {
    const moduleList = ModuleStorage.list().map((name, i) => 
    E('li', 
    { children: 
        [ E('a', 
            { props: { href:'#' }
            , text: name
            })
        ]
    }))

    while (moduleContainer.lastElementChild)
    {
        moduleContainer.removeChild(moduleContainer.lastElementChild)
    }
    
    moduleContainer.append(...moduleList)
}

const modulesBtn = E('li', 
    { children: 
        [ E('a', 
            { props: { href: '#'
            , text: 'Modules'
            } })
        , moduleContainer
        ]
    })
btnList.appendChild(modulesBtn)

export function addModuleToList(title : string, graphCode : string) {
    if (ModuleStorage.get(title))
    {
        const sep = '⎍'
        const [prefix, num] = title.split(sep)
        const newTitle = `${prefix}${sep}${(+num||-1) + 1}`
        ModuleStorage.set(newTitle, graphCode)
    }
    else 
    {
        ModuleStorage.set(title, graphCode)
    }
    refreshList()
}
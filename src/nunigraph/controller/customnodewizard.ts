






import { NuniGraphNode } from "../model/nunigraph_node.js";






const container = D('custom-node-wizard-container')
    // container.style.backgroundColor = 'red'

export function startCustomNodeWizard(node : NuniGraphNode<NodeTypes.MODULE>) {
    container.classList.add('show')
    container.innerHTML = ''
    const dialogBox = pageOne(node)
    container.appendChild(dialogBox)

    container.onclick = onclick
    
    function onclick(e : MouseEvent) {
        if (e.target === container)
        {
            exitWizard()
        }
    }
}

function pageOne(node : NuniGraphNode<NodeTypes.MODULE>) {
    return E('div', { className: 'wizard-page-one preset-list'})
}

function exitWizard() {
    container.classList.remove('show')
    container.onclick = null
}
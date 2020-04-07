

document.onkeydown = updateKeys(true)
document.onkeyup = updateKeys(false)

function updateKeys(keydown : boolean) {
    
    return function(e : KeyboardEvent) { 
        if (keyset.has(e.keyCode)){ 
            G.nodes.forEach(node => {
                const an = node.audioNode
                if (an instanceof SamplerNode && an.active) {
                    an.update(keydown, e.keyCode)
                }
            })
        }
    }
}
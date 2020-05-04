






type NodeKbMode = 'none' | 'mono' | 'poly'
type KbMode = 'mono' | 'poly'

const KB = (() => {
    
    const keys = ([] as number[]).concat(...[
        '1234567890',
        'qwertyuiop',
        'asdfghjkl',
        'zxcvbnm'
        ].map((s,i) => 
            [...s].map(c=>c.toUpperCase().charCodeAt(0))
                .concat([ // add the [];',./ (aka {}:"<>?) keys
                    [189,187],
                    [219,221],
                    [186,222],
                    [188,190,191]
                ][i]) // some of these keys might not work in browsers such as FireFox
            ))
    
    const keymap = keys.reduce((map,key,i) => {
        map[key] = i
        return map
    }, {} as Indexable<number>)

    const held = [] as number[]

    const scale = keys.map((_,i) => i * 100)
    
    function updateKeyDiv(code : number, keydown : boolean) {
        const selector = [
            '[data-key="' + code + '"]',
            '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]'
            ].join(',')
    
        document.querySelector(selector)!
                .classList
                .toggle('key-pressed', keydown)
    }
    
    const kb = { 
        keys, 
        keymap, 
        held, 
        scale, 
        attachToGraph, 
        mode: 'poly' as NodeKbMode
        }


    const monoBtn = D('keyboard-mono-radio')
    const polyBtn = D('keyboard-poly-radio')

    function attachToGraph(g : NuniGraph) {

        D('mono-poly-select')!.onclick = function (e : MouseEvent) {
            const t = e.target
            const isMono = t === monoBtn
            if (isMono || t === polyBtn) {
                kb.mode = isMono ? 'mono' : 'poly'
                switchActiveNodes()
            }
        }

        function switchActiveNodes() {
            for (const { audioNode: an } of g.nodes) {
                if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                    an.setKbMode(kb.mode)
                }
            }
        }

        document.onkeydown = updateKeys(true)
        document.onkeyup = updateKeys(false)

        function updateKeys(keydown : boolean) {
            return (e : KeyboardEvent) => { 
                const key = e.keyCode
        
                if (key in keymap){ 

                    // TODO: only do this when KB is visible
                    // UPDATE THE CUTE KEYBOARD IMAGE
                    updateKeyDiv(key, keydown)
                    
                    // TODO: only update this when mode === mono
                    // UPDATE HELD-KEY ARRAY (for last-note priority)
                    const idx = held.indexOf(key)
                    if (keydown) {
                        if (idx >= 0) return;
                        held.push(key)
                    } else {
                        held.splice(idx,1)
                    }
                    
                    // MAKE THE SOUND HAPPEN
                    for (const { audioNode: an } of g.nodes) {
                        if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                            an.update(keydown, key)
                        }
                    }
                }
            }
        }
    }

    return kb
})()

function resizeKeyboard () {
    const keyboard = D('keyboard-image') as any
    const size = keyboard.parentNode.clientWidth / 60
    keyboard.style.fontSize = size + 'px'
}
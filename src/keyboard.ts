






type KbMode = 'none' | 'mono' | 'poly'

const Keyboard = (() => {
    
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
    
    const keyset = new Set(keys)

    const keymap = keys.reduce((map,key,i) => {
        map[key] = i
        return map
    }, {} as Indexed<number>)

    const held = [] as number[]
    
    function updateKeyDiv(code: number, keydown: boolean) {
        const selector = [
            '[data-key="' + code + '"]',
            '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]'
            ].join(',')
    
        document.querySelector(selector)!
                .classList
                .toggle('key-pressed', keydown)
    }

    return { keys, keyset, keymap, held,
        attachToGraph: (g : NuniGraph) => {

            function updateKeys(keydown : boolean) {
                return (e : KeyboardEvent) => { 
                    const key = e.keyCode
            
                    if (keyset.has(key)){ 
                        updateKeyDiv(key, keydown)
                        
                        const idx = held.indexOf(key)
                        if (keydown) {
                            if (idx >= 0) return;
                            held.push(key)
                        } else {
                            held.splice(idx,1)
                        }
                        
                        g.nodes.forEach(node => {
                            const an = node.audioNode
                            if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                                an.update(keydown, key)
                            }
                        })
                    }
                }
            }

            document.onkeydown = updateKeys(true)
            document.onkeyup = updateKeys(false)
        }
    }
})()
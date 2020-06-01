






import { NuniGraph } from '../../nunigraph/nunigraph.js'
import { NuniSourceNode } from './nuni_source_node.js'

export type NodeKbMode = 'none' | 'mono' | 'poly'
export type KbMode              = 'mono' | 'poly'


export const KB = (() => {
    
    const keyCodes = ([] as number[]).concat(...[
        '1234567890',
        'qwertyuiop',
        'asdfghjkl',
        'zxcvbnm'
        ].map((s,i) => 
            [...s.toUpperCase()].map(c => c.charCodeAt(0))
                .concat([ // add the [];',./ (aka {}:"<>?) keyCodes
                    [189,187],
                    [219,221],
                    [186,222],
                    [188,190,191]
                ][i]) // some of these keyCodes might not work in browsers such as FireFox
            ))
            
    const keymap = keyCodes.reduce((map,key,i) => {
        map[key] = i
        return map
    }, {} as Indexable<number>)

    const held = [] as number[]

    const scale = keyCodes.map((_,i) => i * 100)
    
    const kb = { 
        keyCodes, 
        keymap, 
        held, 
        scale,
        attachToGraph, 
        mode: 'poly' as KbMode,
        connectedNodes: <any>0,
        ADSRs: {} as { [key : number] : ConstantSourceNode }
        }


    const monoBtn = D('keyboard-mono-radio')
    const polyBtn = D('keyboard-poly-radio')

    function attachToGraph(g : NuniGraph) {

        kb.connectedNodes = function*() {
            for (const { audioNode: an } of g.nodes) {
                if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                    yield an
                }
            }
        }

        D('mono-poly-select')!.onclick = function (e : MouseEvent) {
            const t = e.target
            const isMono = t === monoBtn
            
            if (isMono || t === polyBtn) {
                kb.mode = isMono ? 'mono' : 'poly'
                for (const an of kb.connectedNodes()) {
                    an.kbMode = kb.mode
                }
            }
        }

        document.onkeydown = updateKeys(true)
        document.onkeyup = updateKeys(false)

        function updateKeys(keydown : boolean) {
            return ({ keyCode: key } : KeyboardEvent) => {
                if (key in keymap){ 

                    // Maybe only do this when the keyboard image is visible?
                    // TODO: make it match what it actually plays
                    updateKBImage(key, keydown)

                    // UPDATE HELD-KEY ARRAY 
                    // Sets up last-note priority, and prevents event spamming when keys are held.
                    const idx = held.indexOf(key)
                    if (keydown) {
                        if (idx >= 0) return;
                        held.push(key)
                    } else {
                        held.splice(idx,1)
                        if (idx !== held.length && kb.mode === 'mono') {
                            // We are lifting a note that wasnt the last, 
                            // and we're in last node priority.
                            return;
                        }
                    }

                    // MAKE THE SOUND HAPPEN
                    for (const an of kb.connectedNodes()) {
                        an.update(keydown, key)
                    }
                } else {
                    // TODO: implement key-hold, or something.
                    log('keyCode =', key)
                }
            }
        }
    }

    return kb
})()

function updateKBImage(code : number, keydown : boolean) {
    // Updates the keyboard defined in UI/init_kb_image.ts
    const selector = [
        '[data-key="' + code + '"]',
        '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]'
        ].join(',')

    document.querySelector(selector)!
        .classList
        .toggle('key-pressed', keydown)
}
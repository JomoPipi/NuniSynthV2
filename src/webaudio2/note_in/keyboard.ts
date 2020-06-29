






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

export const KB = { 
    keyCodes, 
    keymap, 
    held, 
    scale,
    mode: 'poly' as 'mono' | 'poly',
    nVoices: 10,
    attachToGraph, 
    connectedNodes: function*(){ yield* [] as Indexed[] }
    }

function attachToGraph(getNodes : () => Generator<Indexed, void, unknown>) {
    KB.connectedNodes = getNodes

    document.onkeydown = updateKeys(true)
    document.onkeyup = updateKeys(false)
}

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
                if (idx !== held.length && KB.mode === 'mono') {
                    // We are lifting a note that wasnt the last, 
                    // and we're in last node priority.
                    return;
                }
            }

            // MAKE THE SOUND HAPPEN
            for (const an of KB.connectedNodes()) {
                an.update(keydown, key)
            }

        } else {
            // TODO: implement key-hold, or something.
            log('keyCode =', key)
        }
    }
}

const slider = D('n-poly-slider') as HTMLInputElement
slider.oninput = function () {
    D('n-poly-text')!.innerText = slider.value 
    KB.nVoices = +slider.value
} 

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
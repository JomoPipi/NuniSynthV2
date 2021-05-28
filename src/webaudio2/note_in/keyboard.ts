






const CODES = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"] as const
const KEY_NUMBER = CODES.reduce((a,code,i) => 
    (a[code] = i, a)
    , {} as Record<typeof CODES[number], number>)

const held : number[] = []

const scale = CODES.map((_,i) => i * 100)

export const KB = 
    { CODES
    , held
    , KEY_NUMBER
    , scale
    , mode: 'poly' as 'mono' | 'poly'
    , nVoices: 10
    , attachToGraph
    , updateKeyboardNodes(keydown : boolean, key : number) {}
    }

function attachToGraph(updateKeyboardNodes : (keydown : boolean, key : number) => void) {
    KB.updateKeyboardNodes = updateKeyboardNodes

    document.onkeydown = updateKeys(true)
    document.onkeyup = updateKeys(false)
}

function updateKeys(keydown : boolean) {
    return (e : KeyboardEvent) => {
        const code = e.code as typeof CODES[number]
        if (code in KEY_NUMBER)
        { 
            const n = KEY_NUMBER[code]
            // Maybe only do this when the keyboard image is visible?
            // TODO: make it match what it actually plays
            updateKBImage(n, keydown)

            // UPDATE HELD-KEY ARRAY 
            // Sets up last-note priority, and prevents event spamming when keys are held.
            const idx = held.indexOf(n)
            if (keydown) 
            {
                if (idx >= 0) return;
                held.push(n)
            } 
            else
            {
                held.splice(idx,1)
                if (idx !== held.length && KB.mode === 'mono') 
                {
                    // We are lifting a note that wasnt the last, 
                    // and we're in last node priority.
                    return;
                }
            }
            // MAKE THE SOUND HAPPEN
            KB.updateKeyboardNodes(keydown, n)
        } 
        else 
        {
            console.log('code =', code)
        }
    }
}

const slider = D('n-poly-slider') as HTMLInputElement
slider.oninput = function () {
    D('n-poly-text').innerText = slider.value 
    KB.nVoices = +slider.value
} 

function updateKBImage(code : number, keydown : boolean) {
    const arr = [...document.querySelectorAll(`[key-char="${code}"]`)!]
    
    arr.map(elem => elem
        .classList
        .toggle('key-pressed', keydown))
}
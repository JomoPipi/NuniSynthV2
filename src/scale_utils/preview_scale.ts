






import { KB, NuniSourceNode } from '../webaudio2/internal.js'

export function refreshKeys() {
    // for (const an of KB.connectedNodes()) 
    // {
    //     an.refresh()
    // }
}

export function previewScale() {
    const mode = KB.mode // *
    let count = 0
    for (const key of KB.keyCodes) 
    {
        const cents = KB.scale[KB.keymap[key]]
        if (cents > 2400) return;
        const speed = 100
        setTimeout(() => {
            KB.updateKeyboardNodes(true, key)
            setTimeout(() => 
                KB.updateKeyboardNodes(false, key)
            , (count + 0.5) * speed)
        }, count * speed)
        // for (const an of KB.connectedNodes()) 
        // {
        //     if (an instanceof NuniSourceNode && an.kbMode) 
        //     {
        //         an.playKeyAtTime(key, an.ctx.currentTime + count * speed, speed/2.0)
        //     }
        // }
        count++
    }
}



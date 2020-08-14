






import { KB, NuniSourceNode } from '../webaudio2/internal.js'

export function refreshKeys() {
    for (const an of KB.connectedNodes()) 
    {
        an.refresh()
    }
}

export function previewScale() {
    const mode = KB.mode // *
    let count = 0
    for (const key of KB.keyCodes) 
    {
        const cents = KB.scale[KB.keymap[key]]
        if (cents > 2400) return;
        const speed = 0.1
        for (const an of KB.connectedNodes()) 
        {
            if (an instanceof NuniSourceNode && an.kbMode) 
            {
                an.playKeyAtTime(key, an.ctx.currentTime + count * speed, speed/2.0)
            }
        }
        count++

        // const [on,off] = [true,false].map(bool => 
        //     () => {
        //         if (mode === KB.mode) 
        //         { // *
        //             for (const an of KB.connectedNodes()) 
        //             {
        //                 an.update(bool, key)
        //             }
        //         }
        //     })

        // const speed = 100

        // setTimeout(on, ++count * speed)
        // setTimeout(off, count * speed + speed / 4.0)
    }
    // * prevents bug that may happen when user switches 
    // modes while the scale is being previewed.
}



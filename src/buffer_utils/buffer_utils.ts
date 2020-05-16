






function reverseBuffer(index : number) {
    Buffers.buffers[index].getChannelData(0).reverse()
    Buffers.refreshAffectedBuffers()
}

function invertBuffer(index : number) {
    const arr = Buffers.buffers[index].getChannelData(0)
    for (let i =0; i < arr.length; i++)
        arr[i] *= -1

    Buffers.refreshAffectedBuffers()
}

;(<Indexed>D('buffer-functions')).onclick = (e : MouseEvent) => {
    const btn = e.target as HTMLButtonElement
    log('btn =',btn)
    if (!btn) return
    ;((<Indexed> {
        record:                 () => recordTo(Buffers.currentIndex),
        'reverse-buffer':       () => reverseBuffer(Buffers.currentIndex),
        'invert-buffer':        () => invertBuffer(Buffers.currentIndex),
        'apply-buffer-formula': () => formulateBuffer(Buffers.currentIndex),
        'buffer-formula-length':() => {
            D('buffer-formula-length-text')!.innerText = 
            (D('buffer-formula-length') as HTMLSelectElement).value
        }
    })[btn.id] || id)()
}

// BUFFER EXPS

// cool noise:
// sin(n*sin(n/128) - sin(n/243))
// sin(n/(59 + sin(n/32)))
// sin(n/(12 + sin(n/25)))
// sin(n/(32 + sin(n/(50 + sin(n/2)))))
// [sin(n/20),sin(n/30),sin(n/50),sin(n/70)][n % 4]
// [25,27,32,49].map(x=>sin(n/x))[n % 4]
// [25,27,32,49].map(x=>sin(n/x))[(n % 40)/10 | 0]
// [25,27,32,49].map(x=>cos(x/n)-sin(n/x))[n % 4]
// sin(n/(49 + sin(n/14) / tan(n/14)))
// sin(n/(81 + cos(n/50) / sin(n/25)))
// sin(n/(64 + sin(n/7) / cos(n/49)))
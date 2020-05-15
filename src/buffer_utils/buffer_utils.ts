






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

D('buffer-functions')!.onclick = (e : MouseEvent) => {
    const btn = e.target as HTMLButtonElement
    
    if (!btn) return
    ;((<Indexed> {
        record:           () => recordTo(Buffers.currentIndex),
        'reverse-buffer': () => reverseBuffer(Buffers.currentIndex),
        'invert-buffer':  () => invertBuffer(Buffers.currentIndex)
    })[btn.id] || id)()
}
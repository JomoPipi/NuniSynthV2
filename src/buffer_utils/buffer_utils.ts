






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

// Change buffer index
;['up','down'].forEach((s,i) => {
    D('buffer-index-'+s)!.onclick = () => {
        const idx = Buffers.currentIndex = clamp(0, Buffers.currentIndex + Math.sign(.5 - i), nBuffers-1)
        D('buffer-index')!.innerText = idx.toString()
        Buffers.refreshAffectedBuffers()
    }
})

// Reverse buffer at current index
D('reverse-buffer')!.onclick = () => {
    reverseBuffer(Buffers.currentIndex)
}

// Reverse buffer at current index
D('invert-buffer')!.onclick = () => {
    invertBuffer(Buffers.currentIndex)
}
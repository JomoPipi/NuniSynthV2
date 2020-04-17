






// Switch tabs
D('tab-swapper')!.oninput = function() {
    const value = (D('tab-swapper') as HTMLSelectElement).value
    ;[...document.getElementsByClassName('tab')].forEach((tab:any) => {
        tab.classList.toggle('show', value === tab.id)
    })
    resizeHandler()
}
D('node-options')!.classList.toggle('show',true)

// Help the user
D('about')!.onclick = () =>
    window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')

// Change buffer index
;['up','down'].forEach((s,i) => {
    D('buffer-index-'+s)!.onclick = () => {
        const idx = currentBufferIndex = clamp(0, currentBufferIndex + Math.sign(.5 - i), nBuffers-1)
        D('buffer-index')!.innerHTML = idx.toString()
        refreshAffectedBuffers()
    }
})

// Reverse buffer at current index
D('reverse-buffer')!.onclick = () => {
    BUFFERS[currentBufferIndex].getChannelData(0).reverse()
    refreshAffectedBuffers()
}




function refreshAffectedBuffers() {
    const canvas = D('buffer-canvas') as HTMLCanvasElement

    displayBuffer(BUFFERS[currentBufferIndex], canvas)

    G.nodes.forEach(({ audioNode: an }) => {
        if (an instanceof SamplerNode && an.bufferIndex === currentBufferIndex) {
            an.refresh()
        }
    })
}
refreshAffectedBuffers()

function displayBuffer(buff : AudioBuffer, canvas : HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!
    const H = canvas.height, W = canvas.width
    const channel = buff.getChannelData(0)
    ctx.save()
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#121'
    ctx.globalCompositeOperation = 'lighter'
    ctx.translate(0, H / 2)
    ctx.globalAlpha = 0.06
    for (let i = 0; i < channel.length; i++) {
        const x = W * i / channel.length |0
        const y = channel[i] * H / 2
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + 1, y)
        ctx.stroke()
    }
    ctx.restore()
    console.log('Done rendering buffer')
}




D('nunigraph-canvas')!.oncontextmenu = function(e : MouseEvent) {
    e.preventDefault()
    showGraphContextMenu(e.clientX, e.clientY)
}

function showGraphContextMenu(x : number, y : number) {
    const menu = D('graph-contextmenu') as HTMLDivElement
    menu.style.display = 'grid'
    menu.style.top  = y+'px'
    menu.style.left = x+'px'
}
























MY_JS_DIALS.forEach(dial => {
    // if (dial.id.startsWith('aux')) 
    // {

    //     dial.value = aux_ADSR[dial.id.split`-`[2]]
    //     dial.render()
    //     dial.attach(x => {
    //         aux_ADSR[dial.id.split`-`[2]] = x
    //         aux_ADSR.render()
    //     })

    // } 
    // else if (dial.id.includes('adsr')) 
    {
        const s = (<any>dial).id.split('-')[1]
        dial.value = (ADSR as any)[s]
        dial.render()
        dial.attach((x : number) => {
            (<Indexible>ADSR)[s] = x * x
            ADSR.render()
        })

    }
    // else if (dial.id === 'BPM') {
        
    //     D('BPM-text').innerHTML = BPM,
    //     dial.attach(x => {
    //         BPM = D('BPM-text').innerHTML = (500 ** .5) ** (x+1) | 0  
    //     })
    // }
})







// Switch tabs
D('tab-swapper')!.oninput = function() {
    const value = (D('tab-swapper') as HTMLSelectElement).value
    for (const { id, classList } of document.getElementsByClassName('tab')) {
        classList.toggle('show', value === id)
    }
    resizeHandler()
}
D('node-options')!.classList.toggle('show',true)

// Attach JS dials to ADSR
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
            (<Indexed>ADSR)[s] = x * x
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
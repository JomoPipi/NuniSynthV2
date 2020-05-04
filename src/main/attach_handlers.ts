




{
    const [tabSwapper, scaleKinds] = 
        [D('tab-swapper'), D('scale-kinds')] as HTMLSelectElement[]

    // Switch tabs
    tabSwapper.oninput = function() {
        const value = tabSwapper.value
        for (const { id, classList } of 
            document.getElementsByClassName('_tab_')) {

            classList.toggle('show', value === id)
        }
        resizeHandler()
    }

    // Switch tabs in scale edit tab
    scaleKinds.oninput = function() {
        const value = scaleKinds.value
        for (const { id, classList } of 
            document.getElementsByClassName('_scale-tab_')) {

            classList.toggle('show', value === id)
        }
    }



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
}
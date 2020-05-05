




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
    MY_JS_DIALS.forEach((dial : JsDial) => {
        const id = dial.id as string
        if (id.includes('adsr')) 
        {
            const adsr = ADSR_Controller as Indexed
            const s = id.split('-')[1]
            dial.value = adsr[s]
            dial.render()
            dial.attach((x : number) => {
                adsr[s] = x * x
                ADSR_Controller.render()
            })

        } else {
            throw 'Check what JsDials you have.'
        }
    })
}
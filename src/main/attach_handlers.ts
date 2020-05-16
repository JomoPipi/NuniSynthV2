




{
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
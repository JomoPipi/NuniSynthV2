






const myToFixed = (value : number) => 
    value.toFixed(clamp(0, 3 - Math.ceil(Math.log10(Math.abs(value))), 3))

type RequiredProperties = {
    volumeLevel : number
    volumeLevelUpperLimit : number
}

export function createSliderComponent(audioNode : RequiredProperties) {

    const initialValue = audioNode.volumeLevel
    const initialUpperLimit = audioNode.volumeLevelUpperLimit

    const text = E('span', { className: 'number-box center', text: myToFixed(initialValue) })
        text.style.display = 'inline-block'

    const slider = E('input')
        slider.type = 'range'
        slider.oninput = function () {
            const value = +slider.value
            text.innerText = myToFixed(value)
            audioNode.volumeLevel = value
        }

    const maxValue = E('input', 
        { className: 'number-input-2'
        , props: { type: 'number' }
        })

    setMax(myToFixed(initialUpperLimit))
    slider.value = initialValue.toString()
    maxValue.oninput = () => setMax(maxValue.value)

    const container = E('div', 
        { children: [maxValue, slider, text]
        , className: 'slider-component'
        })

    return container

    function setMax(value : string) {
        const v = +value
        audioNode.volumeLevel = Math.min(v, audioNode.volumeLevel)
        audioNode.volumeLevelUpperLimit = v
        if (v < 0)
        {
            slider.min = value
            slider.max = '0'
        }
        else
        {
            slider.min = '0'
            slider.max = value
        }
        maxValue.value = value
        slider.step = clamp(0, v / 64.0, 1).toString()
    }
}

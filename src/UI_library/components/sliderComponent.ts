






const myToFixed = (value : number) => 
    value.toFixed(clamp(0, 3 - Math.ceil(Math.log10(Math.abs(value))), 4))

export function createSliderComponent(initialValue : number, update : (value : number) => void) {

    const text = E('span', { text: initialValue.toString() })

    const slider = E('input')
        slider.type = 'range'
        slider.oninput = function () {
            text.innerText = slider.value 
            update(+slider.value)
        }

    const maxValue = E('input', 
        { className: 'number-input-2'
        , props: 
            { type: 'number'
            , value: myToFixed(initialValue)
            }
        })

    setMax('1')
    maxValue.oninput = () => setMax(maxValue.value)

    const container = E('div', 
        { children: [maxValue, slider, text]
        , className: 'slider-component'
        })

    return { container, setMax }

    function setMax(value : string) {
        const v = +value
        update(v)
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








import { doUntilMouseUp } from "../events/until_mouseup.js"
import { JsDial } from "./jsdials.js"







type UpdateFuncSettings = {
    amount : number
    min : number
    max : number
    isLinear : boolean
    width? : number
    height? : number
    mouseup? : MouseHandler
    rounds : number
    knobStyle? : 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    size? : number
    }

const myToFixed = (value : number) => 
    value.toFixed(clamp(0, 3 - Math.ceil(Math.log10(Math.abs(value))), 3))

export function createDraggableNumberInput(
    initialValue : number, 
    mousedownFunc : () => number,
    updateFunc : (value : number) => void,
    settings : UpdateFuncSettings) {

    const valueInput = E('input', 
        { className: 'number-grab'
        , props: 
            { type: 'number'
            , value: initialValue
            }
        })
        for (const d of ['width','height'] as 'width'[])
        {
            if (settings[d]) valueInput.style[d] = settings[d] + 'px'
        }

    const state = { startX: 0, startY: 0, startValue: 0 }

    const update = realUpdateFunc(updateFunc, settings)

    const mousedown = function(e : MouseEvent) {
        state.startX = e.clientX
        state.startY = e.clientY
        state.startValue = mousedownFunc()
    }

    const mousemove = function(e : MouseEvent) {
        e.stopPropagation()
        if (e.buttons !== 1) return;
        valueInput.value = 
            update(
                state.startY-e.clientY + (e.clientX-state.startX)/128.0, 
                state.startValue)
    }

    valueInput.onmousedown = doUntilMouseUp({ mousedown, mousemove })
    valueInput.oninput = () => updateFunc(+valueInput.value)
    return valueInput
}

function realUpdateFunc(fn : (value : number) => void, settings : UpdateFuncSettings) {
    return (delta : number, value : number) : string => {

        const { amount, min, max, isLinear } = settings
        const useLinear = isLinear || value === 0
        const factor    = useLinear ? delta : delta * value
        const newValue  = clamp(min, value + factor * amount, max)

        fn(newValue)
        const precision = newValue >= 100 
            ? Math.log10(newValue)+1 
            : newValue >= 1
            ? 3
            : 7
        return newValue.toPrecision(precision)
    }
}

export function createNumberDialComponent2(
    initialValue : number, 
    mousedownFunc : () => number,
    updateFunc : (value : number) => void,
    settings : UpdateFuncSettings) {

    const sizeOfRange = settings.max - settings.min

    const knob = new JsDial()
        knob.sensitivity = 2**7
        const knobMax = sizeOfRange**(1/4)
        knob.max = knobMax
        
    const valueInput = E('input', 
        { className: 'number-input-2'
        , props: 
            { type: 'number'
            , value: initialValue
            }
        })

    const container = E('div', { children: [valueInput, knob.html] })
        container.style.display = 'inline-grid'
        // container.style.gridTemplateRows = '20% 80%'
        // container.style.border = '1px solid red' // = `#${100 + Math.random() * 900 | 0}`

    const component = 
        { container
        , setValue(n : number) {} 
        }
    

    const state = { startX: 0, startY: 0, startValue: 0 }

    const update = realUpdateFunc(updateFunc, settings)

    const mousedown = function(e : MouseEvent) {
        state.startX = e.clientX
        state.startY = e.clientY
        state.startValue = mousedownFunc()
    }

    const mousemove = function(e : MouseEvent) {
        e.stopPropagation()
        if (e.buttons !== 1) return;
        valueInput.value = 
            update(
                state.startY-e.clientY + (e.clientX-state.startX)/128.0, 
                state.startValue)
        updateKnob()
    }
    updateKnob()

    knob.html.onmousedown = doUntilMouseUp({ mousedown, mousemove })
    valueInput.oninput = () => { updateFunc(+valueInput.value), updateKnob() }

    return component

    function updateKnob() {
        const knobValue = +valueInput.value * settings.amount
        knob.update(knobValue)
    }
}




export function createNumberDialComponent3(
    initialValue : number, 
    callback : (n : number) => void,
    settings : UpdateFuncSettings) {

    const mapValue = settings.isLinear
        ? (x : number) => x
        : (x : number) => 5 * x ** 3
        // : (x : number) => 2 ** x

    const unmapValue = settings.isLinear
        ? (x : number) => x
        // : (x : number) => x ** (1/exponent)
        : (x : number) => Math.cbrt(x/5)
        // : (x : number) => Math.log2(x)

    
    const dial = new JsDial({ style: settings.knobStyle })
    if (settings.size) dial.size = settings.size
    dial.min = unmapValue(settings.min)
    dial.max = unmapValue(settings.max)
    dial.value = unmapValue(initialValue)
    dial.sensitivity = settings.amount
    dial.rounds = settings.rounds
    dial.render()
    
    const valueInput = E('input', 
        { className: 'number-input-2'
        , props: 
            { type: 'number'
            , value: myToFixed(initialValue)
            }
        })

    valueInput.oninput = () => {
        const value = +valueInput.value
        callback(value)
        dial.value = unmapValue(value)
        dial.render()
    }

    dial.attach((v : number) => {
        const value = mapValue(v)
        callback(value)
        valueInput.value = myToFixed(value)
    }, { mouseup: settings.mouseup })
    // if (!options.something)
    // {
    //     dial.html.ondblclick = dial.update.bind(null, 1)
    // }

    const container = E('div', 
        { className: 'number-dial-container'
        , children: [valueInput, dial.html]
        })
        // container.style.gridTemplateRows = '20% 80%'
        // container.style.backgroundColor = 'red'
        
    const component = 
        { container
        , setValue(n : number) 
            {
                dial.update(unmapValue(n))
            }
        , getValue()
            {
                return mapValue(dial.value)
            }
        }

    return component
}
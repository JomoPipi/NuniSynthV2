






import { doUntilMouseUp } from "../events/until_mouseup.js"







type UpdateFuncSettings = {
    amount : number
    min : number
    max : number
    isLinear : boolean
    }

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

    valueInput.onmousedown = doUntilMouseUp(mousemove, mousedown)
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
        return newValue.toPrecision(7)
    }
}
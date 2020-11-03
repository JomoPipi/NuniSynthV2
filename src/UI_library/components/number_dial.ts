






import { JsDial } from "./jsdials.js"







export function createNumberDialComponent(
    initialValue : number, 
    manualUpdater : (value : number) => void,
    props : Indexed) {

    const box = E('span', { className: 'number-dial-component' })
    
    const dial = Object.assign(new JsDial(), props.dial)
    
    if (props.ondblclick) 
    {
        dial.html.ondblclick = () => {
            const newValue = props.ondblclick()
            valueInput.value = newValue.toString()
            dial.update(newValue)
        }
    }

    const valueInput = E('input', {
        className: 'number-dial-input',
        props: 
            { type: 'number'
            , value: initialValue
            , oninput: () => {
                manualUpdater(+valueInput.value)
                dial.update(+valueInput.value)
                }
            }
        })
        Object.assign(valueInput, props.input)
        
    dial.attach((value : number) => {
        valueInput.value = value.toString()
        manualUpdater(value)
    })
    
    box.append(valueInput, dial.html)

    return Object.assign(box, {
        setValue(value : number) {
            valueInput.value = value.toString()
            dial.update(value)
            manualUpdater(value)
        }
    })
}
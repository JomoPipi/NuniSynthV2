






export function createToggleSwitch(func : (checked : boolean) => void) {
    const toggle = E('input', { className: 'toggle0' })
    toggle.type = 'checkbox'
    toggle.oninput = () => func(toggle.checked)
    return toggle
}
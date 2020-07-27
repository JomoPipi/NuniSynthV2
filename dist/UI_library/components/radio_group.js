export function createRadioButtonGroup({ buttons, selected, className, onclick, text }) {
    const box = E('span', {
        text,
        children: [E('br')],
    });
    const btns = buttons.map((text) => box.appendChild(E('button', { text,
        className
    })));
    if (typeof selected === 'number') {
        const btn = btns[selected];
        if (!btn)
            throw 'The index is out of bounds';
        btn.classList.add('selected');
    }
    else {
        const btn = btns.find(btn => btn.innerText === selected);
        if (!btn)
            throw 'The string must be the name of a button.';
        btn.classList.add('selected');
    }
    box.onclick = (e) => {
        const btn = e.target;
        const index = btns.indexOf(btn);
        if (index >= 0) {
            onclick(btn.innerText, index);
            for (const _btn of btns) {
                _btn.classList.toggle('selected', _btn === btn);
            }
        }
    };
    return box;
}
//# sourceMappingURL=radio_group.js.map







{
    const presets = {
        Ionian:     '200,400,500,700,900,1100',
        Dorian:     '200,300,500,700,900,1000',
        Phrygian:   '100,300,500,700,800,1000',
        Lydian:     '200,400,600,700,900,1100',
        Mixolydian: '200,400,500,700,900,1000',
        Aeolian:    '200,300,500,700,800,1000',
        Locrian:    '100,300,500,600,800,1000',
        Chromatic:  '100,200,300,400,500,600,700,800,900,1100',
        Wholetone:  '200,400,600,800,1000',
        'Minor Pentatonic': '300,500,700,1000',
        'Major Pentatonic': '200,400,700,900',
        'Altered': '100,300,400,600,800,1000',
        '1.939 EDO': 1.93920847419315,
        '2.536 EDO': 2.53912397616528,
        '3.057 EDO': 3.05777409403176,
        '6.946 EDO': 6.94695029916123
        }
    
    const div = D('scale-preset-list') as HTMLDivElement

    for (const name in presets) {
        const item = E('button')
        item.classList.add('list-btn')
        item.innerText = name
        div.appendChild(item)
    }

    div.onclick = function(e : MouseEvent) {
        const name = (e.target as HTMLElement).innerText
        const P = presets as any
        if (name in P) {
            if (name.endsWith('EDO')) {
                setEqualTemperamentScale(P[name])
            } else {
                setScaleFromCSV(P[name])
            }

        }
    }
}
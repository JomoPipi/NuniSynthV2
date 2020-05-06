






{
    const diatonic = (n : number) => 
        (xs => 
            [...xs.slice(n), ...xs.slice(0,n-2)]
            .reduce((a,v) => 
                a.concat(a[a.length-1] + v * 100)
                , [0]))
        ([2,2,1,2,2,2,1])
        .slice(1, 7)
        .join(',')
    

    const presets = {
        Ionian:     diatonic(0),
        Dorian:     diatonic(1),
        Phrygian:   diatonic(2),
        Lydian:     diatonic(3),
        Mixolydian: diatonic(4),
        Aeolian:    diatonic(5),
        Locrian:    diatonic(6),
        Chromatic:  '100,200,300,400,500,600,700,800,900,1100',
        Wholetone:  '200,400,600,800,1000',
        'Minor Pentatonic': '300,500,700,1000',
        'Major Pentatonic': '200,400,700,900',
        'Altered': '100,300,400,600,800,1000'
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
        if (name in presets) {
            setScaleFromCSV(trace((<any>presets)[name]))
        }
    }
}
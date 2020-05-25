






import { SubgraphSequencer } from '../../webaudio2/sequencers/subgraph-sequencer.js'

export function sequencerControls(an : SubgraphSequencer) {
    const controls = E('div')
    const grid = E('div')

    {
        const btn = E('button')
        btn.innerText = 'play'
        btn.classList.add('kb-button')
        btn.classList.toggle('selected', an.isPlaying)
        btn.onclick = () => {
            const play = !an.isPlaying
            if (play) 
                an.play()
            else 
                an.stop()
            btn.classList.toggle('selected', play)
        }
        controls.appendChild(btn)
    }

    changeStepLength: {
        const text = E('span')
        text.innerText = an.nSteps.toString()
        ;['-','+'].forEach((op,i) => {
            const btn = E('button'); btn.innerText = op
            btn.classList.add('top-bar-btn')
            btn.onclick = () => {
                const v = clamp(0, 
                    an.nSteps + Math.sign(i - .5), 64)
    
                text.innerText = v.toString()
                an.updateSteps(v)
                gridSetup()
            }
            controls.appendChild(btn)
        })
        controls.appendChild(text)
    }

    function gridSetup () {
        grid.innerHTML = ''
        const { nSteps, ADSRs } = an
        for (const key in ADSRs) {
            const row = E('span')
            row.classList.add('flex-center')
            for (let i = 0; i < nSteps; i++) {
                const box = E('span')
                box.classList.add('note-box')
                box.innerText = ':)'
                box.id = `${key}:${i}`
                box.classList.toggle('selected', an.stepMatrix[key][i])
                box.onclick = () => {
                    const on = box.classList.toggle('selected')
                    an.stepMatrix[key][i] = on
                }
                row.appendChild(box)
            }
            grid.appendChild(row)
        }
        controls.appendChild(grid)
    }
    gridSetup()

    return controls
}

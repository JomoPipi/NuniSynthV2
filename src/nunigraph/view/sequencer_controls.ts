






import { Sequencer, BufferSequencer } from '../../webaudio2/internal.js'
import { createToggleButton, createRadioButtonGroup, createNumberDialComponent } from '../../UI_library/internal.js'

export function sequencerControls(an : Sequencer) {

    const controls = E('div')
        // This makes it so that the buttons on top don't wrap to the next line
        controls.style.minWidth = '400px'

    controls.appendChild(createTopRowControls(an))
    
    an.setupGrid()

    controls.appendChild(an.HTMLGrid)

    controls.appendChild(createBottomRowControls(an))

    return controls
}




const subdivisionList = [
    1, 2, 4, 8, 16, 32, 64, 128,
    3, 6, 12, 24, 48, 96, 
    0.5, 0.25, 0.125
    ]
for (let i = 5; i < 64; i++) 
{
    if (!subdivisionList.includes(i)) 
    {
        subdivisionList.push(i)
    }
}




function createTopRowControls(an : Sequencer) {

    const controls = E('div', { className: 'flat-grid flex-center' })
    // const syncCheckBox = E('input')
    
    addPlayButton: {
        const btn = E('button', 
            { text: '▷'
            , className: 'kb-button'
            })
        
        btn.classList.toggle('selected', an.isPlaying)
        btn.onclick = () => {
            const play = btn.classList.toggle('selected')
            if (play) 
            {
                an.play()
            }
            else 
            {
                an.stop()
            }
        }
        controls.appendChild(btn)
    }

    changeStepLength: {
        const box = E('span', { text: 'steps' })
        const text = E('span', { text: an.nSteps.toString() })
        
        ;['-','+'].forEach((op, i) => {
            const btn = E('button', 
                { text: op
                , className: 'top-bar-btn'
                })
                
            btn.onclick = () => {
                const v = clamp(0, 
                    an.nSteps + Math.sign(i - .5), 32)
    
                text.innerText = v.toString()
                an.updateSteps(v)
                an.setupGrid()

                if (an.isPlaying && an.isInSync) 
                {
                    an.stop()
                    an.play()
                }
            }
            box.appendChild(btn)
        })
        box.appendChild(text)
        controls.appendChild(box)
    }

    changeSubdivision: {
        
        const makeSubdivisionButton = (n : number) =>
            E('option', 
                { text: n < 1 
                    ? `${Math.round(1/n)} bars` 
                    : '1/' + n
                , className: 'list-btn' 
                })

        const select = 
            E('select', 
            { children: subdivisionList.map(makeSubdivisionButton) })

        select.value = an.subdiv <= 1 
            ? `${Math.round(1 / an.subdiv)} bars` 
            : '1/' + an.subdiv

        select.onchange = function() {
            const n = select.value.endsWith('bars') 
                ? 1.0/+select.value.split(' ')[0]
                : +select.value.split('/')[1]

            an.subdiv = n
        }

        const box = E('span')
        box.appendChild(select)
        controls.appendChild(box)
    }

    choose_ADSR: {
        controls.appendChild(createRadioButtonGroup(
            { buttons: [...'ABCD']
            , selected: String.fromCharCode(an.adsrIndex + 65)
            , className: 'top-bar-btn'
            , onclick: (data : string, index : number) => {
                an.adsrIndex = index
            }
            , text: 'ADSR'
            }))
    }

    toggleSyncPlay: {
        controls.append(createToggleButton(
            an,
            'isInSync',
            { text: 'sync'
            , update: (on : boolean) =>
                an.noteTime = on
                    ? (an.startTime = an.currentStep = 0)
                    : an.ctx.currentTime
            }
        ))
    }


    return controls
}




function createBottomRowControls(an : Sequencer) {
    const row = E('div', { className: 'flex-center' })

    if (an instanceof BufferSequencer) 
    { // add/remove-input buttons
        const box = E('span')
        ;['-','+'].forEach((text, i) => {
            const btn = E('button', 
                { text
                , className: 'top-bar-btn'
                })
                
            btn.onclick = () => {
                if (text === '+') 
                {
                    an.addInput()
                } 
                else 
                {
                    an.removeInput()
                }
                an.setupGrid()
            }
            box.appendChild(btn)
        })
        row.appendChild(box)
    }

    const box = E('span', { text: 'phase shift' })
    const phaseShift = createNumberDialComponent(
        an.phaseShift || 0,
        (value : number) => an.phaseShift = value, 
        { dial: 
            { sensitivity: 2**-10
            , min: 0
            , max: 1
            , rounds: 1
            , size: 25
            }
        , ondblclick: () => an.phaseShift = 0
        })
    box.appendChild(phaseShift)
    row.appendChild(box)

    stepShift: {
        const box = E('span', 
            { text: 'step shift' 
            , children: [
                E('button', 
                { text: '<'
                , className: 'top-bar-btn'
                }),
                E('button', 
                { text: '>'
                , className: 'top-bar-btn'
                })]
            })

        box.onclick = (e : MouseEvent) => {
            const op = (e.target as HTMLElement).textContent
            if (!'<>'.includes(op!)) return;
            for (const id in an.stepMatrix)
            {
                const row = an.stepMatrix[id]
                if (op === '<')
                {
                    row.push(row.shift()!)
                }
                else
                {
                    row.unshift(row.pop()!)
                }
            }
            an.setupGrid()
        }

        row.appendChild(box)
    }

    return row
}







import { Sequencer, SampleSequencer, MasterClock } from '../../webaudio2/internal.js'
import { createToggleButton, createRadioButtonGroup, createNumberDialComponent } from '../../UI_library/internal.js'
import { createSubdivSelect } from './dialogbox_components.js'

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
        controls.appendChild(createSubdivSelect(an ,
            { fn: _ => an.updateTempo(MasterClock.getTempo())
            , allowFree: true 
            }))
    }

    choose_ADSR: {
        
        // const knobs = D('adsr-knobs')
        // const ADSR = 'attack,decay,sustain,release'.split(',')
        // const adsrDials =
        //     ADSR.reduce((a,s) => {
        //         const dial = new JsDial()
        //         const adsr = ADSR_Controller as Indexed
                
        //         dial.value = adsr.values[adsr.index][s]
        //         dial.sensitivity = 2 ** -10
        //         dial.render()
        //         dial.attach((value : number) => {
        //             adsr.values[adsr.index][s] = value * value
        //             adsr.render()
        //         })
        //         knobs.appendChild(dial.html)
        
        //         a[s] = dial
        //         return a
        //     }, {} as Indexable<JsDial>)

        const LOCAL = 5
        const localADSR = E('span', { text: ' local' })
            localADSR.style.display = an.adsrIndex === LOCAL ? 'inline' : 'none'
        const buttons = [...'ABCD⎍…']
        const globalADSRs = createRadioButtonGroup(
            { buttons
            , selected: buttons[an.adsrIndex]
            , onclick: 
                (data : string, index : number) => {
                    an.adsrIndex = index

                    if (index === LOCAL)
                    {
                        localADSR.style.display = 'inline'
                        globalADSRs.style.display = 'none'
                    }
                }
            })
            globalADSRs.style.display = an.adsrIndex === LOCAL ? 'none' : 'inline'
        const container = E('span', 
            { children: [globalADSRs, localADSR]
            , text: 'ADSR'
            })

        controls.appendChild(container)
    }

    toggleSyncPlay: {
        controls.appendChild(createToggleButton(
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

    if (an instanceof SampleSequencer) 
    { // add new row
        const btn = E('button', 
            { text: '+'
            , className: 'top-bar-btn'
            })
            
        btn.onclick = () => {
            an.addInput()
            an.setupGrid()
        }
        
        row.appendChild(btn)
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
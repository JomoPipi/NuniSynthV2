






import { Sequencer, SampleSequencer, MasterClock } from '../../webaudio2/internal.js'
import { createToggleButton, createRadioButtonGroup, createNumberDialComponent, JsDial } from '../../UI_library/internal.js'
import { createSubdivSelect, createSubdivSelect3 } from './create_subdivselect.js'
import { renderADSR } from '../../webaudio2/adsr.js'

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
        // controls.appendChild(createSubdivSelect(an ,
        //     { fn: _ => an.updateTempo(MasterClock.getTempo())
        //     , allowFree: true 
        //     }))
        controls.appendChild(createSubdivSelect3(
            an.subdiv, 
            value => an.subdiv = value
            ).container)
    }

    choose_ADSR: {
            
        const canvas = E('canvas')
            canvas.width = 56
            canvas.height = 35
            canvas.style.cursor = 'pointer' // The way to get back to global ADSRs
        const ctx = canvas.getContext('2d')!
        const knobs = E('span', { className: 'flex-center' })
            knobs.style.textAlign = 'start' // This stops the knobs from shifting
        const ADSR = 'attack,decay,sustain,release'.split(',')
        const render = () =>
            renderADSR(an.localADSR, ctx, canvas.height, canvas.width, { lineWidth: 2 })
        const adsrDials =
            ADSR.reduce((a : any, s : any) => {
                const dial = new JsDial()
                const adsr = an.localADSR as any

                dial.value = adsr[s]
                dial.size = 24
                dial.sensitivity = 2 ** -10
                dial.render()
                dial.attach((value : number) => {
                    adsr[s] = value * value
                    render()
                })
                knobs.appendChild(dial.html)

                a[s] = dial
                return a
            }, {} as Indexable<JsDial>)
        render()

        function updateKnobs() {
            const adsr = an.localADSR
            for (const s of ADSR) 
            {
                adsrDials[s].update((<Indexed>adsr)[s] ** .5)
            }
        }
        updateKnobs()

        type CurveType = 'linear' | 'logarithmic' | 'exponential' | 'S'
        const next = 
            { linear: 'logarithmic'
            , logarithmic: 'exponential'
            , exponential: 'S'
            , S: 'linear'
            } as Record<CurveType,CurveType>

        const text = E('span', { text: 'ADSR' })
        const setHandlers = () => {
            canvas.onclick = () => {
                an.localADSR.curve = next[an.localADSR.curve]
                render()
            }
            // text.onclick = () => {
            //     localADSR.style.display = 'none'
            //     globalADSRs.style.display = 'inline'
            //     text.onclick = null
            //     canvas.onclick = null
            // }
        }

        const LOCAL = 5

        // TODO: remove adsrIndexes !== 5
        an.adsrIndex = LOCAL

        if (an.adsrIndex === LOCAL)
        {
            setHandlers()
        }
        const localADSR = E('div', 
            { children: [canvas, knobs]
            })
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
                        setHandlers()
                    }
                }
            })
            globalADSRs.style.display = an.adsrIndex === LOCAL ? 'none' : 'inline'
            
        const container = E('span', 
            { children: [text, globalADSRs, localADSR]
            })

            // Using JavaScript to ensure the widths are the same!😃 
            const [a,b] = [globalADSRs.style.display, localADSR.style.display]
            const w1 = container.offsetWidth
            globalADSRs.style.display = b; localADSR.style.display = a
            const w2 = container.offsetWidth
            globalADSRs.style.display = a; localADSR.style.display = b
            container.style.minWidth = Math.max(w1,w2) + 'px'

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
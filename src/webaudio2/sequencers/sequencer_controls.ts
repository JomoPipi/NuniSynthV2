






import { Sequencer, SampleSequencer, MasterClock } from '../internal.js'
import { createToggleButton, createRadioButtonGroup, createNumberDialComponent, JsDial } from '../../UI_library/internal.js'
import { createSubdivSelect3 } from '../../nunigraph/view/create_subdivselect.js'
import { renderADSR } from '../adsr.js'

export function sequencerControls(an : Sequencer) {

    const controls = E('div', { className: 'sequencer-controls' })
        // This makes it so that the buttons on top don't wrap to the next line
        controls.style.minWidth = '400px'

    controls.appendChild(createTopRowControls(an))
    
    an.setupGrid()

    controls.appendChild(an.HTMLGrid)

    controls.appendChild(createBottomRowControls(an))

    return controls
}





function createTopRowControls(an : Sequencer) {

    const controls = E('div', { className: 'flat-grid' })
    // const syncCheckBox = E('input')
    
    addPlayButton: {
        const btn = E('button', 
            { text: '▶'
            , className: 'play-button dim'
            })
        
        btn.classList.toggle('opaque', an.isPlaying)
        btn.onclick = () => {
            const play = btn.classList.toggle('opaque')
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
        const box = E('span', { className: 'step-updater-container' })
        const text = E('span', { text: an.nSteps.toString(), className: 'big-text' })
        
        ;[['←','⇚'],['→','⇛']].forEach(([op1, op2],i) => {
            const column = E('span', { className: 'step-updater' })
            for (const op of [op2,op1])
            {
                const btn = E('button', 
                    { text: op
                    , className: 'nice-btn push-button'
                    })
                    btn.style.verticalAlign = 'middle'
                    
                btn.onclick = () => {
                    const x = op === op2
                        ? an.nSteps * 2 ** Math.sign(i - .5) | 0
                        : an.nSteps + Math.sign(i - .5)
                    const v = clamp(0, x, 32)
        
                    text.innerText = v.toString()
                    if (op === '⇛' && v === an.nSteps * 2)
                    { // I just find this more convenient for the user:
                        an.duplicateSteps()
                    }
                    else
                    {
                        an.updateSteps(v)
                    }
                    an.setupGrid()
                    an.sync()
                }
                column.appendChild(btn)
            }
            box.appendChild(column)
        })

        box.appendChild(text)
        controls.appendChild(box)
        // controls.style.backgroundColor = 'cyan'
    }

    changeSubdivision: {
        controls.appendChild(createSubdivSelect3(
            an.subdiv, 
            value => an.subdiv = value,
            { mouseup() { an.sync() }
            }).container)
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

    return controls
}




function createBottomRowControls(an : Sequencer) {
    const row = E('div', { className: 'sequencer-bottom-row' })
    
    const phaseShifter = E('span', { className: 'flex-center' })
        {
        const percent = E('span', { text: '0.0%', className: 'margin-4' })
            percent.style.display = 'inline-block'
            percent.style.width = '10px'
        const control = E('input', { className: 'fader-0' })
        control.type = 'range'
        control.min = '0'
        control.max = '1'
        control.step = (2**-8).toString()
        control.value = an.phaseShift.toString()
        ;(control.oninput = () => 
            percent.innerText = (100 * (an.phaseShift = +control.value)).toFixed(0) + '%'
        )()
        phaseShifter.append(control, percent)
        }
    row.appendChild(phaseShifter)

    if (an instanceof SampleSequencer) 
    { // add new row
        const btn = E('button', 
            { text: '➕'
            , className: 'top-bar-btn push-button'
            })
            
        btn.onclick = () => {
            an.addInput()
            an.setupGrid()
        }
        
        row.appendChild(btn)
    }

    stepShift: {
        const btnLeft = '«'
        const btnRight = '»'
        const box = E('span', 
            { children: [
                E('button', 
                { text: btnLeft
                , className: 'top-bar-btn push-button'
                }),
                E('button', 
                { text: btnRight
                , className: 'top-bar-btn push-button'
                })]
            })
        box.onclick = (e : MouseEvent) => {
            const op = (e.target as HTMLElement).textContent
            if (btnLeft !== op && btnRight !== op) return;
            for (const id in an.stepMatrix)
            {
                const row = an.stepMatrix[id]
                if (op === btnLeft)
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







import { Sequencer, SampleSequencer, MasterClock } from '../internal.js'
import { createToggleButton, createRadioButtonGroup, createNumberDialComponent, JsDial } from '../../UI_library/internal.js'
import { createSubdivSelect3 } from '../../nunigraph/view/create_subdivselect.js'
import { renderADSR } from '../adsr/adsr.js'
import { createADSREditor } from '../adsr/adsr_editor.js'

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
            }))
    }

    choose_ADSR: {
        // Legacy code:
        an.adsrIndex = 5

        controls.appendChild(createADSREditor(an.localADSR))
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
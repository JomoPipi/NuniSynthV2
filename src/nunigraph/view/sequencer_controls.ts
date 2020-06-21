






import Sequencer from '../../webaudio2/sequencers/sequencer.js'
import BufferSequencer from '../../webaudio2/sequencers/buffer_sequencer.js'

export function sequencerControls(an : Sequencer) {

    const controls = E('div')

    controls.appendChild(createTopRowControls(an))
    
    an.setupGrid()

    controls.appendChild(an.HTMLGrid)

    add_or_remove_inputs: {
        if (an instanceof BufferSequencer) {

            ;['-','+'].forEach((text, i) => {
                const btn = E('button', { 
                    text,
                    className: 'top-bar-btn'
                    })
                    
                btn.onclick = () => {
                    if (text === '+') {

                        an.addInput()
                    } 
                    else {
                        an.removeInput()
                    }
                    
                    an.setupGrid()
                }
                controls.appendChild(btn)
            })

        }

    }

    return controls
}


const subdivisionList = [
    1, 2, 4, 8, 16, 32, 64, 128,
    3, 6, 12, 24, 48, 96,
    ]
for (let i = 5; i < 64; i++) {
    if (!subdivisionList.includes(i)) {
        subdivisionList.push(i)
    }
}

function createTopRowControls(an : Sequencer) {

    const controls = E('div', { className: 'flat-grid flex-center' })
    const syncCheckBox = E('input')
    
    addPlayButton: {
        const btn = E('button', { 
            text: '▷',
            className: 'kb-button'
            })
        
        btn.classList.toggle('selected', an.isPlaying)
        btn.onclick = () => {
            const play = btn.classList.toggle('selected')
            if (play) 
                an.play()
            else 
                an.stop()
        }
        controls.appendChild(btn)
    }

    changeStepLength: {
        const box = E('span', { text: 'steps' })
        const text = E('span', { text: an.nSteps.toString() })
        
        ;['-','+'].forEach((op, i) => {
            const btn = E('button', { 
                text: op,
                className: 'top-bar-btn'
                })
                
            btn.onclick = () => {
                const v = clamp(0, 
                    an.nSteps + Math.sign(i - .5), 32)
    
                text.innerText = v.toString()
                an.updateSteps(v)
                an.setupGrid()

                // We go out of sync because of this
                syncCheckBox.checked = an.isInSync = false
            }
            box.appendChild(btn)
        })
        box.appendChild(text)
        controls.appendChild(box)
    }

    changeSubdivision: {
        const box = E('span')

        const select = E('select', {
            children: subdivisionList
                .map(n => E('option', { 
                    text: '1/' + n,
                    className: 'list-btn' 
                }))
        })
        
        select.onchange = function() {
            const n = select.value.split('/')[1]
            an.subdiv = +n
        }

        box.appendChild(select)
        controls.appendChild(box)
    }

    chooseADSR: {
        const box = E('span', { text: 'ADSR', children: [E('br')] })
        
        const abc = [0,1,2].map(n => {
            const btn = E('button', {
                text: String.fromCharCode(n + 65),
                className: 'top-bar-btn',
                })
                btn.dataset.key = n.toString()
            box.appendChild(btn)
            return btn
        })
        abc[an.adsrIndex].classList.add('selected')
        box.onclick = (e : MouseEvent) => {
            const btn = e.target
            if (btn instanceof HTMLElement && btn.dataset.key) {
                an.adsrIndex = +btn.dataset.key

                for (const _btn of abc) {
                    _btn.classList.toggle('selected', _btn === btn)
                }
            }
        }
        controls.appendChild(box)
    }

    toggleSyncPlay: {
        const box = E('span')
        const text = E('span', { text: 'sync ' })

        syncCheckBox.type = 'checkbox'
        syncCheckBox.checked = an.isInSync

        syncCheckBox.onclick = function() { 
            an.isInSync = syncCheckBox.checked
            if (an.isInSync) {
                an.noteTime = an.startTime = an.currentStep = 0
            }
            else {
                an.noteTime = an.ctx.currentTime
            }
        }
        box.append(text, syncCheckBox)
        controls.append(box)
    }


    return controls
}
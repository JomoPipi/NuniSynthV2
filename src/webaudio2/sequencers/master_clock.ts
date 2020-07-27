






import { createNumberDialComponent } from "../../UI_library/internal.js"







let activated = false, isPaused = false, _tempo = 69

const tempoComponent = createNumberDialComponent(
    120, 
    (value : number) => _tempo = clamp(1, value, 69420),
    { dial: 
        { sensitivity: 2**-2
        , min: 20
        , max: 999
        , rounds: 8
        }
    })

export const MasterClock = {

    setSchedule: (scheduleNotes : (tempo : number) => void) => {
        if (activated) {
            throw 'MasterClock already has a schedule.'
        }
        activated = true
        startScheduling(scheduleNotes)
    },

    getTempo: () => _tempo,

    setTempo: (tempo : number) => tempoComponent.setValue(tempo),
}

MasterClock.setTempo(120)

D('tempo-input-container').appendChild(tempoComponent)


function startScheduling(scheduleNotes : (tempo : number) => void) {

    if (!isPaused) scheduleNotes(_tempo)

    const goAgain = startScheduling.bind(null, scheduleNotes)

    // window.setTimeout(goAgain)
    // More efficient, but sequencer stops when tabs are switched:
    window.requestAnimationFrame(goAgain)
}

// Add tempo tapper
const tapBtn = D('tempo-tapper')
let counter = 0, clearTimer= -1, start = 0, delta = 0

function count() {
    clearTimeout(clearTimer)
    
    if(!start) 
    {
        start = new Date().getTime()
        tempoComponent.classList.add('selected2')
    } 
    else 
    {
        delta = new Date().getTime() - start
        const newTempo = Math.round(60 * 1000 * counter / delta)
        tempoComponent.setValue(newTempo)
        
        // A sec N times
        // 60 sec X times
        // X = N * 60 / A
    }
    counter++
    
    // Reset counter after 2 seconds
    clearTimer = window.setTimeout(function() {
        counter = 0
        delta = 0
        start = 0
        tempoComponent.classList.remove('selected2')
    }, 2000)
}
tapBtn.addEventListener('click', count)


// Add hold button
const holdBtn = D('beat-hold-button')
holdBtn.onmousedown = () => isPaused = true
holdBtn.onmouseup = () => isPaused = false
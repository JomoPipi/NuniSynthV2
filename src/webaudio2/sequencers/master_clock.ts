






import { createNumberDialComponent3 } from "../../UI_library/internal.js"







let _tempo = 69
let _setTempo = (t : number) => {}
let _sync = () => {}

const tempoComponent = createNumberDialComponent3(
    120, 
    (value : number) => {
        _setTempo(value)
        return (_tempo = clamp(1, value, 69420))
    }, 
    { amount: 2 ** -3
    , min: 20
    , max: 999
    , isLinear: true
    , mouseup() { _sync() }
    , shadowKnobClass: 3
    , knobClass: 2
    , rounds: 8
    })

interface ScheduleArgs {
    scheduleNotes() : void
    setTempo(tempo : number) : void
    sync() : void
}

export const MasterClock = {
    activated: false,

    setSchedule({ scheduleNotes, setTempo, sync } : ScheduleArgs) {
        if (this.activated) 
        {
            throw 'MasterClock already has a schedule.'
        }
        this.activated = true
        _setTempo = setTempo
        _sync = sync
        startScheduling(scheduleNotes)
    },

    getTempo() { return _tempo },

    setTempo(tempo : number) {
        tempoComponent.setValue(tempo)
    },
}

MasterClock.setTempo(120)

D('tempo-input-container').appendChild(tempoComponent.container)

let isPaused = false
function startScheduling(scheduleNotes : (now : number) => void) {

    if (!isPaused) scheduleNotes(Date.now())

    const goAgain = startScheduling.bind(null, scheduleNotes)

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
    }, 2000)
}
tapBtn.addEventListener('click', count)


// Add hold button
const holdBtn = D('beat-hold-button')
holdBtn.onmousedown = () => { 
    isPaused = true 
    holdBtn.classList.add('selected')
}
holdBtn.onmouseup = () => { 
    isPaused = false 
    holdBtn.classList.remove('selected')
}
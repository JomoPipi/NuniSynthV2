






let activated = false, isPaused = false

const MasterClock = {
    tempo: 120,

    setSchedule: function (scheduleNotes : (tempo : number) => void) {
        if (activated) 
            throw 'MasterClock already has a schedule.'
        activated = true
        startScheduling(scheduleNotes)
    }
}

function startScheduling(scheduleNotes : (tempo : number) => void) {

    if (!isPaused) scheduleNotes(MasterClock.tempo)

    const goAgain = startScheduling.bind(null, scheduleNotes)

    // window.setTimeout(goAgain)

    // More efficient, but sequencer stops when tabs are switched:
    window.requestAnimationFrame(goAgain)
}

export default MasterClock






// Add tempo input
const tempo = createDraggableNumberInput(
    120,
    
    () => MasterClock.tempo,

    (delta : number, value : number) =>
        (MasterClock.tempo = clamp(20, value + delta, 999)).toFixed(0),

    (value : number) => 
        MasterClock.tempo = value 
)
tempo.style.width = '100px'
D('tempo-input-container')!.appendChild(tempo)



// Add tempo tapper
const tapBtn = D('tempo-tapper')!
let counter = 0, clearTimer= -1, start = 0, delta = 0

function count() {
    clearTimeout(clearTimer)
    
    if(!start) {
        start = new Date().getTime()
        tempo.classList.add('selected2')
    } else {
        delta = new Date().getTime() - start
        const newTempo = Math.round(60 * 1000 * counter / delta)
        tempo.value = newTempo.toString()
        MasterClock.tempo = newTempo
        
        // A sec N times
        // 60 sec X times
        // X = N * 60 / A
    }
    counter++
    
    // Reset counter after 2 seconds
    clearTimer = setTimeout(function(){
        counter = 0
        delta = 0
        start = 0
        tempo.classList.remove('selected2')
    }, 2000)
}
tapBtn.addEventListener('click', count)


// Add hold button
const holdBtn = D('beat-hold-button')!
holdBtn.onmousedown = () => isPaused = true
holdBtn.onmouseup = () => isPaused = false







let activated = false

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

    scheduleNotes(MasterClock.tempo)

    const goAgain = startScheduling.bind(null, scheduleNotes)

    window.setTimeout(goAgain)

    // More efficient, but sequencer stops when tabs are switched.
    // window.requestAnimationFrame(goAgain)
}

export default MasterClock
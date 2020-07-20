import { createNumberDialComponent } from "../../UI_library/internal.js";
let activated = false, isPaused = false;
export const MasterClock = {
    tempo: 120,
    setSchedule: function (scheduleNotes) {
        if (activated)
            throw 'MasterClock already has a schedule.';
        activated = true;
        startScheduling(scheduleNotes);
    }
};
function startScheduling(scheduleNotes) {
    if (!isPaused)
        scheduleNotes(MasterClock.tempo);
    const goAgain = startScheduling.bind(null, scheduleNotes);
    window.requestAnimationFrame(goAgain);
}
const tempo = createNumberDialComponent(120, (value) => MasterClock.tempo = value, { dial: {
        sensitivity: 2 ** -2,
        min: 20,
        max: 999,
        rounds: 8
    }
});
D('tempo-input-container').appendChild(tempo);
const tapBtn = D('tempo-tapper');
let counter = 0, clearTimer = -1, start = 0, delta = 0;
function count() {
    clearTimeout(clearTimer);
    if (!start) {
        start = new Date().getTime();
        tempo.classList.add('selected2');
    }
    else {
        delta = new Date().getTime() - start;
        const newTempo = Math.round(60 * 1000 * counter / delta);
        tempo.setValue(newTempo);
        MasterClock.tempo = newTempo;
    }
    counter++;
    clearTimer = window.setTimeout(function () {
        counter = 0;
        delta = 0;
        start = 0;
        tempo.classList.remove('selected2');
    }, 2000);
}
tapBtn.addEventListener('click', count);
const holdBtn = D('beat-hold-button');
holdBtn.onmousedown = () => isPaused = true;
holdBtn.onmouseup = () => isPaused = false;
//# sourceMappingURL=master_clock.js.map
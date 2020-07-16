import { BufferSequencer } from '../../webaudio2/internal.js';
export function sequencerControls(an) {
    const controls = E('div');
    controls.style.minWidth = '400px';
    controls.appendChild(createTopRowControls(an));
    an.setupGrid();
    controls.appendChild(an.HTMLGrid);
    add_or_remove_inputs: {
        if (an instanceof BufferSequencer) {
            ;
            ['-', '+'].forEach((text, i) => {
                const btn = E('button', {
                    text,
                    className: 'top-bar-btn'
                });
                btn.onclick = () => {
                    if (text === '+') {
                        an.addInput();
                    }
                    else {
                        an.removeInput();
                    }
                    an.setupGrid();
                };
                controls.appendChild(btn);
            });
        }
    }
    return controls;
}
const subdivisionList = [
    2, 4, 8, 16, 32, 64, 128,
    3, 6, 12, 24, 48, 96,
    1, 0.5, 0.25, 0.125
];
for (let i = 5; i < 64; i++) {
    if (!subdivisionList.includes(i)) {
        subdivisionList.push(i);
    }
}
function createTopRowControls(an) {
    const controls = E('div', { className: 'flat-grid flex-center' });
    addPlayButton: {
        const btn = E('button', {
            text: '▷',
            className: 'kb-button'
        });
        btn.classList.toggle('selected', an.isPlaying);
        btn.onclick = () => {
            const play = btn.classList.toggle('selected');
            if (play)
                an.play();
            else
                an.stop();
        };
        controls.appendChild(btn);
    }
    changeStepLength: {
        const box = E('span', { text: 'steps' });
        const text = E('span', { text: an.nSteps.toString() });
        ['-', '+'].forEach((op, i) => {
            const btn = E('button', {
                text: op,
                className: 'top-bar-btn'
            });
            btn.onclick = () => {
                const v = clamp(0, an.nSteps + Math.sign(i - .5), 32);
                text.innerText = v.toString();
                an.updateSteps(v);
                an.setupGrid();
                if (an.isPlaying && an.isInSync) {
                    an.stop();
                    an.play();
                }
            };
            box.appendChild(btn);
        });
        box.appendChild(text);
        controls.appendChild(box);
    }
    changeSubdivision: {
        const box = E('span');
        const select = E('select', {
            children: subdivisionList
                .map(n => E('option', {
                text: n <= 1 ? `${Math.round(1 / n)} bars` : '1/' + n,
                className: 'list-btn'
            }))
        });
        select.value = an.subdiv <= 1 ? `${Math.round(1 / an.subdiv)} bars` : '1/' + an.subdiv;
        select.onchange = function () {
            const n = select.value.endsWith('bars')
                ? 1.0 / +select.value.split(' ')[0]
                : +select.value.split('/')[1];
            an.subdiv = n;
        };
        box.appendChild(select);
        controls.appendChild(box);
    }
    choose_ADSR: {
        controls.appendChild(createRadioButtonGroup({
            buttons: [...'ABCD'],
            selected: String.fromCharCode(an.adsrIndex + 65),
            className: 'top-bar-btn',
            onclick: (data, index) => {
                an.adsrIndex = index;
            },
            text: 'ADSR'
        }));
    }
    toggleSyncPlay: {
        controls.append(createToggleButton(an, 'isInSync', { text: 'sync',
            update: (on) => an.noteTime = on
                ? (an.startTime = an.currentStep = 0)
                : an.ctx.currentTime
        }));
    }
    return controls;
}
//# sourceMappingURL=sequencer_controls.js.map
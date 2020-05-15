






function pageGroupify(parent : HTMLElement, pageIds : string[]) {
    D(pageIds[0]+'-btn')!.classList.add('selected')
    parent.onclick = (e : MouseEvent) => {
        if (e.target === parent) return;
        for (const pageId of pageIds) {
            const page = D(pageId)!
            const btn = D(pageId + '-btn')!
            const isTarget = e.target === btn
            
            btn.classList.toggle('selected', isTarget)
            page.classList.toggle('show', isTarget)
        }
    }
}

pageGroupify(D('tab-swapper')!, [
    'graph-tab',
    'keyboard-tab',
    'buffer-edit-tab',
    'waveform-edit-tab',
    'sequencer-tab'
    ])


pageGroupify(D('scale-kinds')!, [
    'preset-library',
    'scale-builder'
    ])

// <div id="tab-swapper">
// <!-- THE VALUES HERE ARE THE IDs OF TABS -->
// <span value="graph-tab">         Graph          </span>
// <span value="keyboard-tab">      Keyboard       </span>
// <span value="buffer-edit-tab">   Buffers        </span>
// <span value="waveform-edit-tab"> Waveforms      </span>
// <span value="sequencer-tab">     Sequencer      </span>
// </div>







import { GraphController } from '../nunigraph/init.js'
import { ADSR_Controller } from '../webaudio2/adsr.js'
import { MasterClock } from '../webaudio2/sequencers/master_clock.js'

export function makeNuniFile() {
    return JSON.stringify(
        { graphCode: GraphController.g.toJSON()
        , values: ADSR_Controller.values
        , tempo: MasterClock.getTempo()
        })
}
makeNuniFile.currentFileName = ''

export async function loadNuniFile(nuniFile : string) {
    GraphController.closeAllWindows()
    const { graphCode, values, tempo } = JSON.parse(nuniFile)
    await GraphController.g.fromJSON(graphCode)
    ADSR_Controller.values = values
    const t = tempo ?? 120
    if (!tempo) console.warn('Tempo set to default: 120')

    MasterClock.setTempo(t)

    GraphController.renderer.render()
    ADSR_Controller.render({ updateKnobs: true })
}
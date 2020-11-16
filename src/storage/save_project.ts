






import { GraphController } from '../nunigraph/init.js'
import { ADSR_Controller } from '../webaudio2/adsr.js'
import { MasterClock } from '../webaudio2/sequencers/master_clock.js'
import { UserOptions, defaultUserConfig } from './user_options.js'

export function makeNuniFile() {
    return JSON.stringify(
        { graphCode: GraphController.g.toJSON()
        , values: ADSR_Controller.values
        , tempo: MasterClock.getTempo()
        , userConfig: UserOptions.config
        })
}
makeNuniFile.currentFileName = ''

export function loadNuniFile(nuniFile : string) {
    GraphController.closeAllWindows()
    const { graphCode, values, tempo, userConfig } = JSON.parse(nuniFile)
    UserOptions.config = userConfig || defaultUserConfig()
    GraphController.g.fromJSON(graphCode)

    // ADSR_Controller.values = values
    for (let i = 0; i < 4; i++) 
    // Older graphs do not support
    // Additional ADSRs
        ADSR_Controller.values[i] = values[i]

    const t = tempo ?? 120
    if (!tempo) console.warn('Tempo set to default: 120')

    MasterClock.setTempo(t)

    GraphController.renderer.render()
    ADSR_Controller.render({ updateKnobs: true })
}







import { GraphController } from '../nunigraph/init.js'
import { ADSR_Controller } from '../webaudio2/adsr.js'

export function makeFile() {
    return trace(JSON.stringify({
        graphCode: GraphController.g.toRawString(),
        values: ADSR_Controller.values
    }))
}

export function loadFile(f : string) {
    const { graphCode, values } = JSON.parse(f)
    GraphController.g.fromRawString(graphCode)
    ADSR_Controller.values = values

    GraphController.renderer.render()
    ADSR_Controller.render()
}
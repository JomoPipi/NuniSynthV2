






import { BufferUtils } from "./init_buffers.js"
import { recordTo } from "./record.js"
import { formulateBuffer } from "./buffer_formula.js"
import { BufferStorage } from "../storage/buffer_storage.js"
import { createSubdivSelect2 } from "../nunigraph/view/create_subdivselect.js"
import { MasterClock } from "../webaudio2/internal.js"




function reverseBuffer(index : number) {
    console.warn('this should not be used because it mutates the buffers')
    BufferStorage.get(index).getChannelData(0).reverse()
    BufferStorage.get(index, true).getChannelData(0).reverse()
    BufferUtils.refreshAffectedBuffers()
}

function invertBuffer(index : number) {
    const arr = BufferStorage.get(index).getChannelData(0)
    for (let i = 0; i < arr.length; i++) 
    {
        arr[i] *= -1
    }
    BufferUtils.refreshAffectedBuffers()
}

const funcMap = 
    { record:                 () => recordTo(BufferUtils.currentIndex)
    , 'reverse-buffer':       () => reverseBuffer(BufferUtils.currentIndex)
    , 'invert-buffer':        () => invertBuffer(BufferUtils.currentIndex)
    , 'apply-buffer-formula': () => formulateBuffer(BufferUtils.currentIndex)
    }

D('buffer-functions').onclick = (e : MouseEvent) => {
    const btn = e.target as HTMLElement
    ;(funcMap[btn.id as keyof typeof funcMap] || (() => void 0))()
}

const lengthSlider = D('new-buffer-length') as HTMLSelectElement
const lengthText = D('new-buffer-length-text')

const setLength = (value : number) => {
    const seconds = (60 * 4 / MasterClock.getTempo() / value)
    lengthSlider.value = lengthText.innerText = seconds.toString()
    BufferUtils.nextBufferDuration = seconds
}

lengthSlider.oninput = () => {
    const seconds = lengthSlider.value
    lengthText.innerText = seconds
    BufferUtils.nextBufferDuration = +seconds
}

const subdivSelect2 = createSubdivSelect2(setLength)
    subdivSelect2.style.backgroundColor = 'gray' // Makes a gray line on top.. just looks pretty :)

D('buffer-length-stuff').append(subdivSelect2)


// D('open-buffer-edit-dialog-button').onclick = () =>
//     toggleBufferEditDialog(BufferUtils.currentIndex)


// BUFFER EXPS

// cool noise:
// sin(n*sin(n/128) - sin(n/243))
// sin(n/(59 + sin(n/32)))
// sin(n/(12 + sin(n/25)))
// sin(n/(32 + sin(n/(50 + sin(n/2)))))
// [sin(n/20),sin(n/30),sin(n/50),sin(n/70)][n % 4]
// [25,27,32,49].map(x=>sin(n/x))[n % 4]
// [25,27,32,49].map(x=>sin(n/x))[(n % 40)/10 | 0]
// [25,27,32,49].map(x=>cos(x/n)-sin(n/x))[n % 4]
// sin(n/(49 + sin(n/14) / tan(n/14)))
// sin(n/(81 + cos(n/50) / sin(n/25)))
// sin(n/(64 + sin(n/7) / cos(n/49)))


function toggleBufferEditDialog(index : number) {
    // const d
}
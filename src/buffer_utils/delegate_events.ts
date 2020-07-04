






import { BufferUtils } from "./init_buffers.js"
import { recordTo } from "./record.js"
import { formulateBuffer } from "./buffer_formula.js"
import { BufferStorage } from "../storage/general/buffer_storage.js"




function reverseBuffer(index : number) {
    BufferStorage.get(index).getChannelData(0).reverse()
    BufferUtils.refreshAffectedBuffers()
}

function invertBuffer(index : number) {
    const arr = BufferStorage.get(index).getChannelData(0)
    for (let i =0; i < arr.length; i++)
        arr[i] *= -1

    BufferUtils.refreshAffectedBuffers()
}

const funcMap = {
    record:                 () => recordTo(BufferUtils.currentIndex),
    'reverse-buffer':       () => reverseBuffer(BufferUtils.currentIndex),
    'invert-buffer':        () => invertBuffer(BufferUtils.currentIndex),
    'apply-buffer-formula': () => formulateBuffer(BufferUtils.currentIndex)
}

;(<HTMLElement>D('buffer-functions')).onclick = (e : MouseEvent) => {
    const btn = e.target as HTMLElement
    ;(funcMap[btn.id as keyof typeof funcMap] || (() => void 0))()
}

D('new-buffer-length')!.oninput = () => {
    const value = (D('new-buffer-length') as HTMLSelectElement).value
    D('new-buffer-length-text')!.innerText = value
    BufferUtils.nextBufferDuration = +value
}

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

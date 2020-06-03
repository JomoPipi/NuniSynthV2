






import { bufferController } from "./internal.js"
import { recordTo } from "./internal.js"
import { formulateBuffer } from "./internal.js"




function reverseBuffer(index : number) {
    bufferController.buffers[index].getChannelData(0).reverse()
    bufferController.refreshAffectedBuffers()
}

function invertBuffer(index : number) {
    const arr = bufferController.buffers[index].getChannelData(0)
    for (let i =0; i < arr.length; i++)
        arr[i] *= -1

    bufferController.refreshAffectedBuffers()
}

;(<HTMLElement>D('buffer-functions')).onclick = (e : MouseEvent) => {
    const btn = e.target as HTMLButtonElement
    
    if (!btn) return;
    ;((<Indexed> {
        record:                 () => recordTo(bufferController.currentIndex),
        'reverse-buffer':       () => reverseBuffer(bufferController.currentIndex),
        'invert-buffer':        () => invertBuffer(bufferController.currentIndex),
        'apply-buffer-formula': () => formulateBuffer(bufferController.currentIndex),
        'new-buffer-length':() => {
            const value = (D('new-buffer-length') as HTMLSelectElement).value
            D('new-buffer-length-text')!.innerText = value
            bufferController.nextBufferDuration = +value
        }
    })[btn.id] || ((x:any) => x))()
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

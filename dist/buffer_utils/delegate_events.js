import { BufferUtils } from "./init_buffers.js";
import { recordTo } from "./record.js";
import { formulateBuffer } from "./buffer_formula.js";
import { BufferStorage } from "../storage/buffer_storage.js";
function reverseBuffer(index) {
    BufferStorage.get(index).getChannelData(0).reverse();
    BufferUtils.refreshAffectedBuffers();
}
function invertBuffer(index) {
    const arr = BufferStorage.get(index).getChannelData(0);
    for (let i = 0; i < arr.length; i++) {
        arr[i] *= -1;
    }
    BufferUtils.refreshAffectedBuffers();
}
const funcMap = { record: () => recordTo(BufferUtils.currentIndex),
    'reverse-buffer': () => reverseBuffer(BufferUtils.currentIndex),
    'invert-buffer': () => invertBuffer(BufferUtils.currentIndex),
    'apply-buffer-formula': () => formulateBuffer(BufferUtils.currentIndex)
};
D('buffer-functions').onclick = (e) => {
    const btn = e.target;
    (funcMap[btn.id] || (() => void 0))();
};
D('new-buffer-length').oninput = () => {
    const value = D('new-buffer-length').value;
    D('new-buffer-length-text').innerText = value;
    BufferUtils.nextBufferDuration = +value;
};
function toggleBufferEditDialog(index) {
}
//# sourceMappingURL=delegate_events.js.map
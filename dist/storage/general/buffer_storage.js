const buffers = {};
function get(key) {
    return buffers[key];
}
function set(key, buffer) {
    buffers[key] = buffer;
}
export const BufferStorage = { set, get };
//# sourceMappingURL=buffer_storage.js.map
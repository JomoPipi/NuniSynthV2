






const buffers = {} as Indexable<AudioBuffer>

function get(key : number) {
    return buffers[key]
}

function set(key : number, buffer : AudioBuffer) {
    buffers[key] = buffer
}

function list() {
    return Object.keys(buffers)
}

export const BufferStorage = { set, get, list }
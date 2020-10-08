






import { audioCtx } from "../webaudio2/internal.js"







const buffers = {} as Indexable<AudioBuffer>
const reversedBuffers = {} as Indexable<AudioBuffer>
const imageNeedsUpdate = {} as Indexable<boolean> 

function get(key : number, reversed? : boolean) {
    return (reversed ? reversedBuffers : buffers)[key]
}

function set(key : number, buffer : AudioBuffer) {
    buffers[key] = buffer
    setReversed(key, buffer)
    imageNeedsUpdate[key] = true
}

function setReversed(key : number, buffer : AudioBuffer) {
    const n = buffer.numberOfChannels
    const clone = audioCtx.createBuffer(n, buffer.length, buffer.sampleRate)
    for (let ch = 0; ch < n; ch++)
    {
        clone.copyToChannel(buffer
            .getChannelData(ch)
            .map(x=>x)
            .reverse()
        , ch);
    }
    reversedBuffers[key] = clone
}

function list() {
    return Object.keys(buffers)
}

export const BufferStorage = { set, get, list, imageNeedsUpdate }
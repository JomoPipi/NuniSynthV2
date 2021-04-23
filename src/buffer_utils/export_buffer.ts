






import { BufferStorage } from "../storage/buffer_storage.js"
import { BufferUtils } from "./init_buffers.js"

const path = require('path')
const fs = require('fs')
const { dialog, app } = require('electron').remote

export function exportCurrentBuffer() {
    const dir = app.getPath('music')
    const title = 'Save .WAV File'
    const filters = [{ name: 'wav', extensions: ['wav'] }]

    const options = 
        { title
        , filters
        , defaultPath: path.join(dir)
        }

    dialog
        .showSaveDialog(options)
        .then(({ canceled, filePath } : Indexed) => {
            if (!canceled) 
            {
                const wav = (window as any).audioBufferToWav(BufferStorage.get(BufferUtils.currentIndex))
                const buffer = Buffer.from(new Uint8Array(wav))
                fs.writeFile(filePath, buffer, (e : Error) => {})
            }
        })
}







import { BufferUtils } from "../buffer_utils/internal.js"
import { audioCtx } from "../webaudio2/internal.js"
import { BufferStorage } from "./buffer_storage.js"

// File System Dialog

import { makeNuniFile, loadNuniFile } from "./save_project.js"

const { dialog } = require('electron').remote

const { app } = require('electron').remote
const userDataPath : string = app.getPath('userData')
const fs = require('fs')

const projectsFolderPath = userDataPath + '\\Projects'

if (!fs.existsSync(projectsFolderPath)) 
{
    log(`Created folder in ${projectsFolderPath}`)
    fs.mkdirSync(projectsFolderPath)
}

// const store = new Store()
// store.set('unicorn', '🦄')
// console.log(store.get('unicorn'))

export function saveProject() {
    D('wait-cursor').classList.add('show')

    if (makeNuniFile.currentFileName) 
    {
        const fileName = makeNuniFile.currentFileName
        const file = makeNuniFile()
        const filePath = projectsFolderPath + '\\' 
            + fileName
            + '.nuni'

        saveProtocol(filePath, file)

        D('main-nav-menu').style.cursor = 'wait'
    } 
    else 
    {
        saveProjectAs()
    }
    
    setTimeout(() => {
        D('wait-cursor').classList.remove('show')
    }, 500)
}

const title = 'NuniSynth Project Folder'
const filters = [{ name: 'nuni', extensions: ['nuni'] }]

export function saveProjectAs() {

    const fileName = makeNuniFile.currentFileName
    const options = 
        { title
        , filters
        , defaultPath: projectsFolderPath 
            + '\\'
            + (fileName || 'Untitled')
        }

    dialog
        .showSaveDialog(options)
        .then(({ canceled, filePath } : Indexed) => {
            if (!canceled) 
            {
                const file = makeNuniFile()
                saveProtocol(filePath, file)
                setProjectTitle(filePath)
            }
        })
}

export function openExistingProject() {

    const options = 
        { title
        , filters
        , defaultPath: projectsFolderPath 
        }

    dialog
        .showOpenDialog(options)
        .then(({ canceled, filePaths } : Indexed) => {
            if (!canceled) 
            {
                const file = fs.readFileSync(filePaths[0], 'utf8')
                loadNuniFile(file)
                setProjectTitle(filePaths[0])
                loadBuffers(filePaths[0])
            }
        })
}

function setProjectTitle(path : string) {
    D('project-title').textContent =
    makeNuniFile.currentFileName = 
        path
            .replace(projectsFolderPath, '')
            .replace('.nuni', '')
            .slice(1)
}

function saveProtocol(filePath : string, file : string) {
    fs.writeFileSync(filePath, file)
    const fileName = filePath.split('\\').pop()!.replace('.nuni', '')
    saveBuffers(fileName)
}








const audioBuffersFolderPath = userDataPath + '\\AudioBuffers'

if (!fs.existsSync(audioBuffersFolderPath)) 
{
    log(`Created folder in ${audioBuffersFolderPath}`)
    fs.mkdirSync(audioBuffersFolderPath)
}

const KEY_SEPARATOR = '-__-'
const CHANNEL_SEPARATOR = '_--_'
const META = '-_-_-metadata'

function saveBuffers(fileName : string) {
    const buffersPath = audioBuffersFolderPath + '\\' + fileName
    
    for (let key = 0; key < 26; key++)
    {
        const path = buffersPath + KEY_SEPARATOR + key
        const audioBuffer = BufferStorage.get(key)
        const { numberOfChannels, length, sampleRate } = audioBuffer
        const metadata = JSON.stringify({ numberOfChannels, length, sampleRate })
        const metadataPath = path + META
        fs.writeFileSync(metadataPath, metadata)

        for (let i = 0; i < numberOfChannels; i++)
        {
            const float32Array = audioBuffer.getChannelData(i)
            const buffer = Buffer.from(float32Array.buffer)
            const channelPath = path + CHANNEL_SEPARATOR + i
            fs.writeFileSync(channelPath, buffer)
        }
    }
}

function loadBuffers(filePath : string) {
    const fileName = filePath.split('\\').pop()!.replace('.nuni', '')
    const buffersPath = audioBuffersFolderPath + '\\' + fileName
    
    for (let key = 0; key < 26; key++)
    {
        const path = buffersPath + KEY_SEPARATOR + key
        const metadataPath = path + META
        if (!fs.existsSync(metadataPath))
        {
            console.warn('could not retrieve buffer metadata at ' + metadataPath)
            return;
        }
        const metadata = fs.readFileSync(metadataPath)
        const { numberOfChannels, length, sampleRate } = JSON.parse(metadata)
        
        const newAudioBuffer = audioCtx.createBuffer(
            numberOfChannels,
            length, 
            sampleRate)

        for (let ch = 0; ch < numberOfChannels; ch++)
        {
            const channelPath = path + CHANNEL_SEPARATOR + ch
            const loadedBuffer = fs.readFileSync(channelPath)
            const f32Array = new Float32Array(loadedBuffer.buffer)
            newAudioBuffer.copyToChannel(f32Array, ch)   
        }
        BufferStorage.set(key, newAudioBuffer)
        BufferUtils.refreshAffectedBuffers(key)
    }
}








function roundTripTest() {
    const buffersPath = audioBuffersFolderPath + '\\' + '__test__'
    const audioBuffer = BufferStorage.get(0)
    const nChannels = audioBuffer.numberOfChannels
    const newAudioBuffer = audioCtx.createBuffer(
        nChannels,
        audioBuffer.length, 
        audioCtx.sampleRate)
    
    for (let i = 0; i < nChannels; i++)
    {
        const float32Array = audioBuffer.getChannelData(i)
        const buffer = Buffer.from(float32Array.buffer)

        const path = buffersPath + '-' + i
        fs.writeFileSync(path, buffer)
        const loadedBuffer = fs.readFileSync(path)

        const f32a = new Float32Array(loadedBuffer.buffer)
        newAudioBuffer.copyToChannel(f32a, i)
    }
    BufferStorage.set(1, newAudioBuffer)
}
// ;(window as any).testBuffer = roundTripTest
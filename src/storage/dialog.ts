






import { BufferUtils } from "../buffer_utils/internal.js"
import { audioCtx } from "../webaudio2/internal.js"
import { BufferStorage } from "./buffer_storage.js"

// File System Dialog

import { makeNuniFile, loadNuniFile } from "./save_project.js"
import { UserOptions } from "./user_options.js"

const { dialog, app } = require('electron').remote
const userDataPath : string = app.getPath('userData')

// Switch for typechecking:
// import fs from 'fs'
// import path from 'path'
const fs = require('fs')
const path = require('path')

const projectsFolderPath = path.join(userDataPath, 'Projects')

if (!fs.existsSync(projectsFolderPath)) 
{
    console.log(`Created folder in ${projectsFolderPath}`)
    fs.mkdirSync(projectsFolderPath)
}

export function saveProject() {
    D('wait-cursor').classList.add('show')

    if (makeNuniFile.currentFileName) 
    {
        const fileName = makeNuniFile.currentFileName
        const file = makeNuniFile()
        const filePath = path.join(projectsFolderPath, fileName + '.nuni')

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
        , defaultPath: path.join(projectsFolderPath, fileName || 'Untitled')
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

function setProjectTitle(pathToFile : string) {
    D('project-title').textContent =
    makeNuniFile.currentFileName = 
        path.basename(pathToFile).replace('.nuni', '')
}

function saveProtocol(filePath : string, file : string) {
    UserOptions.config.lastSavedProjectPath = filePath
    UserOptions.save()
    fs.writeFileSync(filePath, file)
    const fileName = filePath.split(path.sep).pop()!.replace('.nuni', '')
    saveBuffers(fileName)
}








const audioBuffersFolderPath = path.join(userDataPath, 'AudioBuffers')
const audioBuffersImportsPath = path.join(userDataPath, 'AudioBufferImports')

const folders = [audioBuffersFolderPath, audioBuffersImportsPath]
for (const folderPath of folders)
{
    if (!fs.existsSync(folderPath)) 
    {
        console.log(`Created folder at ${folderPath}.`)
        fs.mkdirSync(folderPath)
    }
}

const CHANNEL_SEPARATOR = '-__-'
const META = '-_-_-metadata'

function saveBuffers(fileName : string) {
    const buffersPath = path.join(audioBuffersFolderPath, fileName)
    
    if (!fs.existsSync(buffersPath)) 
    {
        console.log(`Created folder for ${fileName}'s audio buffers at ${buffersPath}.`)
        fs.mkdirSync(buffersPath)
    }
    
    for (let key = 0; key < BufferUtils.nBuffers; key++)
    {
        const fileName = BufferStorage.getImportedFileName(key)
        if (fileName)
        {
            saveImportBuffer(key, fileName)
        }
        else
        {
            saveLocalBuffer(key)
        }
    }

    function saveImportBuffer(key : number, fileName : string) {
        const pathToFile = path.join(buffersPath, key.toString())
        const metadata = JSON.stringify({ fileName })
        const metadataPath = pathToFile + META
        fs.writeFileSync(metadataPath, metadata)
    }

    function saveLocalBuffer(key : number) {
        const pathToFile = path.join(buffersPath, key.toString())
        const audioBuffer = BufferStorage.get(key)
        const { numberOfChannels, length, sampleRate } = audioBuffer

        const metadata = JSON.stringify({ numberOfChannels, length, sampleRate })
        const metadataPath = pathToFile + META
        fs.writeFileSync(metadataPath, metadata)

        for (let ch = 0; ch < numberOfChannels; ch++)
        {
            const float32Array = audioBuffer.getChannelData(ch)
            const buffer = Buffer.from(float32Array.buffer)
            const channelPath = pathToFile + CHANNEL_SEPARATOR + ch
            fs.writeFileSync(channelPath, buffer)
        }
    }
}

function loadBuffers(filePath : string) {
    const fileName = filePath.split(path.sep).pop()!.replace('.nuni', '')
    const buffersPath = path.join(audioBuffersFolderPath, fileName)

    for (let key = 0; key < BufferUtils.nBuffers; key++)
    {
        const pathToFile = path.join(buffersPath, key.toString())
        const metadataPath = pathToFile + META
        if (!fs.existsSync(metadataPath))
        {
            console.warn('Could not retrieve buffer metadata at ' + metadataPath)
            return;
        }
        const metadata = JSON.parse(fs.readFileSync(metadataPath, { encoding: 'utf-8' }))
        if (metadata.fileName)
        {
            const audioFilePath = path.join(audioBuffersImportsPath, metadata.fileName)
                        
            fetch(audioFilePath)
                // Read it into memory as an arrayBuffer
                .then(response => trace(response).arrayBuffer())
                // Turn it from mp3/aac/whatever into raw audio data
                .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    BufferStorage.set(key, audioBuffer, metadata.fileName)
                    BufferUtils.refreshBuffer(key)
                    if (key === BufferUtils.currentIndex) BufferUtils.updateCurrentBufferImage()
                })
                .catch(e => console.warn('That file likely no longer exists', e))
        }
        else
        {
            const { numberOfChannels, length, sampleRate } = metadata
            
            const newAudioBuffer = audioCtx.createBuffer(
                numberOfChannels,
                length, 
                sampleRate)
    
            for (let ch = 0; ch < numberOfChannels; ch++)
            {
                const channelPath = pathToFile + CHANNEL_SEPARATOR + ch
                const loadedBuffer = fs.readFileSync(channelPath)
                const f32Array = new Float32Array(loadedBuffer.buffer)
                newAudioBuffer.copyToChannel(f32Array, ch)
            }
            BufferStorage.set(key, newAudioBuffer)
            BufferUtils.refreshBuffer(key)
        }
    }
}

export function importAudioFile() {
    const options = 
        { title: 'Import an audio file'
        , filters: { name: 'nuni', extensions: ['wav','aac','mp3','ogg'] }
        , defaultPath: audioBuffersImportsPath
        }

    dialog
        .showOpenDialog(options)
        .then(({ canceled, filePaths } : Indexed) => {
            if (!canceled) 
            {
                const fileName = path.basename(filePaths[0])
                const pathToFile = path.join(audioBuffersImportsPath, fileName)

                // Copy the file to the imports folder:
                fs.copyFileSync(filePaths[0], pathToFile)

                // Make the file writable:
                fs.chmodSync(pathToFile, 0o666);

                fetch(pathToFile)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        BufferStorage.set(BufferUtils.currentIndex, audioBuffer, fileName)
                        BufferUtils.updateCurrentBufferImage()
                        BufferUtils.refreshBuffer(BufferUtils.currentIndex)
                    })
                    .catch(e => console.log('look at this fucking error',e))
            }
        })
        .catch((e : Error) => console.warn('the error is:',e))
}







function roundTripTest() {
    // This test saves the contents of buffer A to disk,
    // And then loads it into buffer B

    const buffersPath = path.join(audioBuffersFolderPath, '__test__')
    const audioBuffer = BufferStorage.get(0)
    const nChannels = audioBuffer.numberOfChannels
    const newAudioBuffer = audioCtx.createBuffer(
        nChannels,
        audioBuffer.length, 
        audioCtx.sampleRate)
    
    for (let i = 0; i < nChannels; ++i)
    {
        const float32Array = audioBuffer.getChannelData(i)
        const buffer = Buffer.from(float32Array.buffer)

        const pathToFile = buffersPath + '-' + i
        fs.writeFileSync(pathToFile, buffer)
        const loadedBuffer = fs.readFileSync(pathToFile)

        const f32a = new Float32Array(loadedBuffer.buffer)
        newAudioBuffer.copyToChannel(f32a, i)
    }
    BufferStorage.set(1, newAudioBuffer)
}
// ;(window as any).testBuffer = roundTripTest


export function loadLastSavedProject() {
    const lastProjectPath = UserOptions.config.lastSavedProjectPath
    if (lastProjectPath)
    {
        const file = fs.readFileSync(lastProjectPath, 'utf8')
        loadNuniFile(file)
        setProjectTitle(lastProjectPath)
        loadBuffers(lastProjectPath)
    }
}
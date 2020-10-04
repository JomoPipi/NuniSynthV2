






import { BufferUtils } from "../buffer_utils/internal.js"
import { BufferStorage } from "./buffer_storage.js"
// File System Dialog

import { makeNuniFile, loadNuniFile } from "./save_project.js"

const { dialog } = require('electron').remote

const { app } = require ('electron').remote
const userDataPath = app.getPath ('userData')
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

function saveBuffers(fileName : string) {
    const buffersPath = audioBuffersFolderPath + '\\' + fileName
    if (!fs.existsSync(buffersPath)) 
    {
        fs.mkdirSync(buffersPath)
    }
    for (let i = 0; i < BufferUtils.nBuffers; i++)
    {
        const path = buffersPath + '\\' + i
        fs.writeFileSync(path, Buffer.from(BufferStorage.get(i).getChannelData(0)))
    }
}

function loadBuffers(path : string) {
    const fileName = path.split('\\').pop()!.replace('.nuni', '')
    const buffersPath = audioBuffersFolderPath + '\\' + fileName

    try {
        for (let i = 0; i < BufferUtils.nBuffers; i++)
        {
            const path = buffersPath + '\\' + i
            const buff = fs.readFileSync(path)
            const f32Array = Float32Array.from(buff)
            BufferStorage.get(i).copyToChannel(f32Array, 0)   
        }
    } 
    catch(e)
    {
        console.warn('failed to read buffers')
    }
}
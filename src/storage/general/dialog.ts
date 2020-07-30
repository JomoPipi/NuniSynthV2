






// File System Dialog

import { makeNuniFile, loadNuniFile } from "../../main/save_project.js"

// const Store = require('electron-store').remote
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
    if (makeNuniFile.currentFileName) 
    {
        D('wait-cursor').classList.add('show')

        const file = makeNuniFile()
        const filePath = projectsFolderPath + '\\' 
            + makeNuniFile.currentFileName
            + '.nuni'

        fs.writeFileSync(filePath, file)

        D('main-nav-menu').style.cursor = 'wait'
        
        setTimeout(() => {
            D('wait-cursor').classList.remove('show')
        }, 500)
    } 
    else 
    {
        saveProjectAs()
    }
}

const title = 'NuniSynth Project Folder'
const filters = [{ name: 'nuni', extensions: ['nuni'] }]

export function saveProjectAs() {

    const options = 
        { title
        , filters
        , defaultPath: projectsFolderPath 
            + '\\'
            + (makeNuniFile.currentFileName || 'Untitled')
        }

    dialog
        .showSaveDialog(options)
        .then(({ canceled, filePath } : Indexed) => {
            if (!canceled) 
            {
                const file = makeNuniFile()
                fs.writeFileSync(filePath, file)
                makeNuniFile.currentFileName = 
                    D('project-title').textContent =
                    filePath
                        .replace(projectsFolderPath, '')
                        .replace('.nuni', '')
                        .slice(1)
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
                log('filePaths[0] =',filePaths[0])
                loadNuniFile(fs.readFileSync(filePaths[0], 'utf8'))
                makeNuniFile.currentFileName = 
                    filePaths[0]
                        .replace(projectsFolderPath, '')
                        .replace('.nuni', '')
                        .slice(1)
            }
        })
}







// File System Dialog

import { makeFile, loadFile } from "../../main/save_project.js"

// const Store = require('electron-store').remote
const { dialog } = require('electron').remote

const { app } = require ('electron').remote
const userDataPath = app.getPath ('userData')
const fs = require('fs')

const projectsFolderPath = userDataPath + '\\Projects'

if (!fs.existsSync(projectsFolderPath)) {
    log('created folder')
    fs.mkdirSync(projectsFolderPath)
}

// const store = new Store()

// store.set('unicorn', '🦄')
// console.log(store.get('unicorn'))

const defaultOptions = { 
    defaultPath: projectsFolderPath,
    title: ':)',
    filters: [
        { name: 'nuni', extensions: ['nuni'] }
        ]
    }

export function openExistingProject() {
    console.log(dialog)
    
    dialog
        .showOpenDialog(defaultOptions)
        .then(({ canceled, filePaths } : Indexed) => {
            if (!canceled) {
                loadFile(filePaths[0])
                log(`loaded file: ${filePaths[0]}`)
            }
        })
}

export function saveProjectAs() {
    dialog
        .showSaveDialog(defaultOptions)
        .then(({ canceled, filePath } : Indexed) => {
            if (!canceled) {
                const file = makeFile()
                fs.writeFile(filePath, file, (err : string) => {
                    if (err) throw err
                    log(`file ${filePath} saved`)
                })
            }
        })
}







const { app } = require ('electron').remote
const userDataPath = app.getPath ('userData')

// Switch for typechecking:
// import fs from 'fs'
// import path from 'path'
const fs = require('fs')
const path = require('path')

const modulesFolderPath = path.join(userDataPath, 'Modules')

if (!fs.existsSync(modulesFolderPath)) 
{
    log(`Created folder in ${modulesFolderPath}`)
    fs.mkdirSync(modulesFolderPath)
}

function get(key : string) {
    const pathToFile = path.join(modulesFolderPath, getModuleNames().find(name => name === key)!)
    const file = fs.readFileSync(pathToFile, 'utf8')
    return file
}

function has(key : string) {
    return getModuleNames().some(name => name === key)
}

function set(key : string, graphCode : string) {
    saveModule(key, graphCode)
}

function list() {
    return getModuleNames()
}

export const ModuleStorage = { set, get, list, has, deleteModule }

function saveModule(key : string, graphCode : string) {
    D('wait-cursor').classList.add('show')

    const file = graphCode
    const filePath = path.join(modulesFolderPath, key)

    fs.writeFileSync(filePath, file)

    D('main-nav-menu').style.cursor = 'wait'
    
    setTimeout(() => {
        D('wait-cursor').classList.remove('show')
    }, 500)
}

function getModuleNames() : string[] {
    return fs
        .readdirSync(modulesFolderPath)
        .filter((file : any) => fs.statSync(path.join(modulesFolderPath, file)).isFile())
}

function deleteModule(name : string, callback : Function) {
    const p = path.join(modulesFolderPath, name)
    fs.unlink(p, (err : Error) => {
        if (err) throw Error
        callback()
        console.log('deleted',p)
    })
}







const { app } = require ('electron').remote
const userDataPath = app.getPath ('userData')
const fs = require('fs')

const modulesFolderPath = userDataPath + '\\Modules'

if (!fs.existsSync(modulesFolderPath)) 
{
    log(`Created folder in ${modulesFolderPath}`)
    fs.mkdirSync(modulesFolderPath)
}

function get(key : string) {
    const path = modulesFolderPath + '\\' + getModuleNames().find(name => name === key)
    const file = fs.readFileSync(path, 'utf8')
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

export const ModuleStorage = { set, get, list, has }

function saveModule(key : string, graphCode : string) {
    D('wait-cursor').classList.add('show')

    const file = graphCode
    const filePath = modulesFolderPath + '\\' + key

    fs.writeFileSync(filePath, file)

    D('main-nav-menu').style.cursor = 'wait'
    
    setTimeout(() => {
        D('wait-cursor').classList.remove('show')
    }, 500)
}

function getModuleNames() : string[] {
    return fs
        .readdirSync(modulesFolderPath)
        .filter((file : any) => fs.statSync(modulesFolderPath + '/' + file).isFile())
}
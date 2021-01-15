






// Switch for typechecking:
// import fs from 'fs'
// import path from 'path'
const fs = require('fs')
const path = require('path')

const { app } = require('electron').remote
const userDataPath : string = app.getPath('userData')
const filePath = path.join(userDataPath, 'useroptions')

type UserConfig = {
    'Show Node Images' : boolean
    theme : 0 | 1 | 2 | 3
}

const DefaultConfig : UserConfig = 
    { 'Show Node Images': true
    , theme: 0
    } as const

export const UserOptions = 
    { config: getUserConfig()
    , save
    } as const

function getUserConfig() : UserConfig {
    try 
    {
        const file = fs.readFileSync(filePath, 'utf8')
        const config = JSON.parse(file)
        for (const key in DefaultConfig)
        {
            const k = key as keyof UserConfig
            config[key] = config[key] || DefaultConfig[k]
        }
        log('config = ',config)
        return config as UserConfig
    } 
    catch (e)
    {
        log('Creating the file for the first time:', e)
        const config = JSON.stringify(DefaultConfig)
        save(config)
        return JSON.parse(config)
    }
}

function save(_file? : string) {
    const file = _file || JSON.stringify(UserOptions.config)
    log('now we are saving!@! filpath,file =',
    filePath,'\n\n', file)
    fs.writeFileSync(filePath, file)
}
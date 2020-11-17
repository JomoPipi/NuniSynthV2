






const fs = require('fs')
const { app } = require('electron').remote
const userDataPath : string = app.getPath('userData')
const filePath = userDataPath + '\\useroptions'

export const UserOptions = 
    { config: getUserConfig()
    , save
    }

function getUserConfig() {
    try 
    {
        const file = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(file)
    } 
    catch (e)
    {
        console.log('Creating the file for the first time:', e)
        const config = JSON.stringify({ 'Show Node Image': true })
        save(config)
        return config
    }
}

function save(_file? : string) {
    const file = _file || JSON.stringify(UserOptions.config)
    fs.writeFileSync(filePath, file)
}







const { app, BrowserWindow, contentTracing } = require('electron')
const path = require('path')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) 
{ // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow(
    { width: 500
    , height: 500
    , webPreferences: 
      { nodeIntegration: true
      , preload: './preload.js'
      , enableRemoteModule: true
      // , devTools: false // TODO : uncomment for production
      }
    , icon: __dirname + '/../styles/icon.ico'
    , frame: false
    , fullscreenable: true
    , opacity: 1
    })
  
  // mainWindow.setMenu(null)

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/../index.html'))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

}

app.on('ready', _ => { 
  // Transparency Workaround
  setTimeout(createWindow, 10)
})

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) 
  {
    setTimeout(createWindow, 10)
  }
})

// app.whenReady().then(() => {
//   (async () => {
//     await contentTracing.startRecording({
//       include_categories: ['*']
//     })
//     console.log('Tracing started')
//     await new Promise(resolve => setTimeout(resolve, 5000))
//     const path = await contentTracing.stopRecording()
//     console.log('Tracing data recorded to ' + path)
//   })()
// })



// TODO: find out what this security warning is actually about
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
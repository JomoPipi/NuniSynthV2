






const { app, BrowserWindow, dialog, Menu } = require('electron')
const path = require('path')
const log = require('electron-log');

const { autoUpdater } = require("electron-updater")

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'nunisynthv2',
    owner: 'JomoPipi',
    private: true,
    token: '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'
})

//! TOP LEVEL RETURN:
// if(1+1 === 2) {
//   console.log('it is!')
//   return;
// }

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
//! REMOVED SQUIRREL.WINDOWS
// if (require('electron-squirrel-startup')) 
// { // eslint-disable-line global-require
//   app.quit()
// }
// if (handleSquirrelEvent()) {
//   // squirrel event handled and app will exit in 1000ms, so don't do anything else
//   return;
// }
const template = []

if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}


let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
  console.log('sent a message!', text)
}
function createDefaultWindow() {
  win = new BrowserWindow({
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
      }
  });
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);

  win.webContents.on('did-finish-load', () => {
    sendStatusToWindow('Initializing...')
  });

  return win;
}

autoUpdater.on('checking-for-update', () => {
  console.log('swag swag checking for updates')
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});


app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});

const createWindow = () => {
  // Create the browser window.
  const { width, height } = require('electron').screen.getPrimaryDisplay().size
  const mainWindow = new BrowserWindow(
    { title: 'NuniSynth'
    , width//: 500
    , height//: 500
    , webPreferences: 
      { nodeIntegration: true
      , preload: './preload.js'
      , enableRemoteModule: true
      , contextIsolation: false
      // , devTools: false // TODO : uncomment for production
      }
    , icon: __dirname + '/../styles/icon.ico'
    , frame: false
    , fullscreenable: true
    , opacity: 1
    })
  mainWindow.webContents.openDevTools()
  // mainWindow.setMenu(null)

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/../index.html'))

  const toggleFullscreen = (() => {
    let fullscreen = false
    return () => {
      mainWindow.setFullScreen(fullscreen ^= true)
    }
  })()

  // Open the DevTools:
  // mainWindow.webContents.openDevTools()


  // Receive Traffic Light Message:
  const { ipcMain } = require('electron')
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log('arg =',arg)
    if (arg === 'minimize-window')
    {
      mainWindow.setFullScreen(false)
      mainWindow.minimize()
    }
    else if (arg === 'restore-window') 
    {
      toggleFullscreen()
      mainWindow.restore()
    }
    else if (arg === 'close-window')
    {
      dialog.showMessageBox(mainWindow,
        { type: 'question'
        , buttons: ['Yes', 'No']
        , title: 'Confirm'
        , message: 'Are you sure you want to quit? Unsaved work will be lost.'
        })
        .then(({ response, checkboxChecked }) => {
          if (response === 0) app.quit()
        })
    }
  })
}

app.on('ready', _ => { 
  // Transparency Workaround
  autoUpdater.checkForUpdatesAndNotify()
  // autoUpdater.checkForUpdates()
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
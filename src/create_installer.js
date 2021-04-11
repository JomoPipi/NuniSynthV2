






const electronInstaller = require('electron-winstaller')

;(async function() {
// NB: Use this syntax within an async function, Node does not have support for
//     top-level await as of Node 12.
try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: './installer',
      outputDirectory: '/tmp/build/installer64',
      authors: 'Ronald Corona',
      exe: './nunisynth.exe'
    });
    console.log('It worked!');
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }

})()







const { ipcRenderer } = require('electron')

const buttons = [D('minimize-window'), D('restore-window'), D('close-window')]
const lights = D('traffic-lights')

lights.onclick = (e : Event) => {
    const target = e.target as HTMLElement
    if (buttons.includes(target))
    {
        ipcRenderer.send('asynchronous-message', target.id)
    }
}

export {}
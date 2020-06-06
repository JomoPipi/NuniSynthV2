






import './nunigraph/controller/presets.js'
import './scales/internal.js'
import './buffer_utils/internal.js'
import './main/resize.js'


console.log('o-O-__-O-o-_.._-o-O-__-O-oo-O-__-O-o-_.._-o-O-__-O-oo-O-__-O-o-_.._-o-O-__-O-oo-O-__-O-o-_.._-o-O-__-O-o')


window.onload = () => {
    log('Everything has been loaded')

    D('loading-screen')!.style.opacity = '0'
    setTimeout(() => 
        D('loading-screen')!.style.display = 'none', 1000)
}
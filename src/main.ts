






import './scale_utils/internal.js'
import './buffer_utils/internal.js'
import './nunigraph/controller/presets.js'
import './nunigraph/controller/graph_handlers.js'
import './main/resize.js'
import './main/file_menu_UI.js'

// Turn off turn deployment
// import './tests/copy_graph_test.js'

log('o-O-__-O-o-_.._-o-O-__-O-oo-O-__-O-o-_.._-o-O-__-O-oo-O-__-O-o-_.._-o-O-__-O-oo-O-__-O-o-_.._-o-O-__-O-o')


window.onload = () => {
    log('Everything has been loaded')

    D('loading-screen').style.opacity = '0'
    setTimeout(() => 
        D('loading-screen').style.display = 'none', 2000)

    
    // D('scene').style.opacity = '0'
    // setTimeout(() => 
    //     D('scene').style.display = 'none', 2000)
}
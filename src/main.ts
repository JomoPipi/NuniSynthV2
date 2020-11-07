






import './UI_setup/internal.js'
import './scale_utils/internal.js'
import './buffer_utils/internal.js'
import './nunigraph/controller/presets.js'
import './nunigraph/controller/graph_handlers.js'

// Turn off for production
import './tests/copy_graph_test.js'


window.onload = () => {
    log('Everything has been loaded')

    D('loading-screen').style.opacity = '0'
    setTimeout(() => 
        D('loading-screen').style.display = 'none', 2000)
}

// sequencer type
// 1: https://codepen.io/njmcode/pen/PwaXwB
// 2: https://www.youtube.com/watch?v=MOGA2q9_5Zw (go to 8:10)
// 3: https://www.youtube.com/watch?v=TQIneYEEW_g

// composer idea
// https://dram.cf/synth/
// https://tonejs.github.io/demos
// https://danielx.net/composer/
// https://onlinesequencer.net/import2/d7dbf89263ab96092e4c944e8b563b20?title=STEVIE_WONDER_-_Golden_Lady.mid

// similar program
// https://eternal.robcheung.com/

// Value curve module/function/node:
// https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setValueCurveAtTime

// equalizer
// https://stackoverflow.com/questions/30065093/web-audio-api-equalizer
// https://stackoverflow.com/questions/12738056/creating-a-10-band-equalizer-using-web-audio-api

// ! YouTube Playlist "Synth Ideas"

// https://codepen.io/ejones/pen/mJlCb

// Keypad beatmaker thingy (good sounds)
// https://codepen.io/nuobiruteskalno/pen/abdLEeq


// https://codepen.io/Grilly86/pen/vIALz
// https://codepen.io/tomhodgins/pen/ZOmxaZ
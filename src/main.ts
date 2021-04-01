



// COPYRIGHT 2021 Ronald Corona

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

DIRTYGLOBALS

import './UI_setup/internal.js'
import './scale_utils/internal.js'
import './buffer_utils/internal.js'
import './nunigraph/controller/modularize_graph.js'

window.onload = () => {
    console.log('[[((--##--)) Begin NuniSynth ((--##-))]]')

    D('loading-screen').style.opacity = '0'
    setTimeout(() => 
        D('loading-screen').style.display = 'none', 2000)

    
    if (DEV_MODE_EQUALS_TRUE)
    {
        import('./tests/all_tests.js')
    }
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

// Sick ADSR
// https://codepen.io/jhnsnc/pen/KXYayG
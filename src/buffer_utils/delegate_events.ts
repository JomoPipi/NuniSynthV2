






import { BufferUtils } from "./init_buffers.js"
import { recordTo } from "./record.js"
import { formulateBuffer } from "./buffer_formula.js"
import { BufferStorage } from "../storage/buffer_storage.js"


// const bufferEditContent = `<div class="main-tab">


// <br>

// <div id="buffer-edit-create-select" class="flat-grid color1 swapper">
//   <span id="buffer-edit-btn"> EDIT </span>
//   <span id="buffer-create-btn"> CREATE </span>
// </div>

// <div id="buffer-functions">
  
//   <div id="buffer-edit" class="_tab_">

//     <button id="reverse-buffer" class="neumorph"> 
//       reverse </button>

//     <button id="invert-buffer" class="neumorph">  
//       invert </button>

//   </div>

  
//   <div id="buffer-create" class="_tab_ show">

//     <span>
//       NEW BUFFER LENGTH:
//       <span class="code2"
//         id="new-buffer-length-text"> 
//         3 
//       </span> seconds </span> <br>

//       <input 
//         id="new-buffer-length"
//         type="range" 
//         min=0.1 
//         max=20
//         step=0.1
//         value=3> 
        
//     </span>
//     <br>
//     <span id="formula-template-container"> </span>

//     <div class="builder-section center">

//       <button id="record" class="record"> 
//         rec </button>

//       <span id="record-type-radio" class="center">

//         <input id="record-mic" 
//           type="radio"
//           name="record-radio"
//           checked="true">
//         <label for="record-mic" class="record-radio"> 
//           record mic
//         </label>
        
//         <input id="record-graph" 
//           type="radio"
//           name="record-radio">
//         <label for="record-graph" class="record-radio"> 
//           record graph
//         </label>

//       </span>

//     </div>

//     <div class="builder-section">
//       Buffer Expression:
//       <button id="buffer-formula-templates-button" class="apply-btn" style="float:right"> 
//           PRESETS 📋 </button>

//       <br>
//       <span class="smaller-text">

//           <span class="code2">  n  </span> represents the position of each sample in the buffer.
//           Samples should be numbers -1 and 1. Use JavaScript
//             <a 
//               target="_blank" 
//               href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators"> 
//               operators </a> 
//           and
//             <a 
//               target="_blank"
//               href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math"> 
//               functions </a>.
//           <br>
          
//       </span>
      
//       <code>
//         for n in range [0, 48000 * seconds]: <br>
//         &nbsp; &nbsp; samples[n] =
//       </code>

//       <input
//           type="text" 
//           id="buffer-formula"
//           class="text-input-wide center"
//           value="sin(n/30) + sin(n/20)"> 

//       <button id="apply-buffer-formula" class="apply-btn"> apply </button>

//       <div id="buffer-formula-error-msg" class="error-msg"></div>

//     </div>

//   </div>
  
// </div>

// </div>`

function reverseBuffer(index : number) {
    BufferStorage.get(index).getChannelData(0).reverse()
    BufferUtils.refreshAffectedBuffers()
}

function invertBuffer(index : number) {
    const arr = BufferStorage.get(index).getChannelData(0)
    for (let i = 0; i < arr.length; i++) 
    {
        arr[i] *= -1
    }
    BufferUtils.refreshAffectedBuffers()
}

const funcMap = 
    { record:                 () => recordTo(BufferUtils.currentIndex)
    , 'reverse-buffer':       () => reverseBuffer(BufferUtils.currentIndex)
    , 'invert-buffer':        () => invertBuffer(BufferUtils.currentIndex)
    , 'apply-buffer-formula': () => formulateBuffer(BufferUtils.currentIndex)
    }

D('buffer-functions').onclick = (e : MouseEvent) => {
    const btn = e.target as HTMLElement
    ;(funcMap[btn.id as keyof typeof funcMap] || (() => void 0))()
}

D('new-buffer-length').oninput = () => {
    const value = (D('new-buffer-length') as HTMLSelectElement).value
    D('new-buffer-length-text').innerText = value
    BufferUtils.nextBufferDuration = +value
}

// D('open-buffer-edit-dialog-button').onclick = () =>
//     toggleBufferEditDialog(BufferUtils.currentIndex)


// BUFFER EXPS

// cool noise:
// sin(n*sin(n/128) - sin(n/243))
// sin(n/(59 + sin(n/32)))
// sin(n/(12 + sin(n/25)))
// sin(n/(32 + sin(n/(50 + sin(n/2)))))
// [sin(n/20),sin(n/30),sin(n/50),sin(n/70)][n % 4]
// [25,27,32,49].map(x=>sin(n/x))[n % 4]
// [25,27,32,49].map(x=>sin(n/x))[(n % 40)/10 | 0]
// [25,27,32,49].map(x=>cos(x/n)-sin(n/x))[n % 4]
// sin(n/(49 + sin(n/14) / tan(n/14)))
// sin(n/(81 + cos(n/50) / sin(n/25)))
// sin(n/(64 + sin(n/7) / cos(n/49)))


function toggleBufferEditDialog(index : number) {
    // const d
}
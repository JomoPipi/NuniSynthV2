// visual keyboaard stuff 
const keyboard = document.querySelector('.keyboard') as any

function getKey (e : KeyboardEvent) {
  const code = e.keyCode
  if (!keyset.has(code)) return
  const selector = [
    '[data-key="' + code + '"]',
    '[data-char*="' + encodeURIComponent(String.fromCharCode(code)) + '"]'
  ].join(',')
  
  return document.querySelector(selector)
}

function updateKey(keydown : boolean) {
    return (e : KeyboardEvent) => {
        getKey(e)?.classList.toggle('key-pressed', keydown)
    }
}

document.body.addEventListener('keydown', updateKey(true))
document.body.addEventListener('keyup', updateKey(false))


function resizeKeyboard () {
  const size = keyboard.parentNode.clientWidth / 180
  keyboard.style.fontSize = size + 'px'
}




// actual keyboard stuff
document.onkeydown = updateKeys(true)
document.onkeyup = updateKeys(false)

function updateKeys(keydown : boolean) {
    
    return function(e : KeyboardEvent) { 
        // log(e.keyCode) 
        if (keyset.has(e.keyCode)){ 
            G.nodes.forEach(node => {
                const an = node.audioNode
                if (an instanceof SamplerNode && an.active) {
                    an.update(keydown, e.keyCode)
                }
            })
        }
    }
}




// function keyboardify(node : NuniGraphNode)
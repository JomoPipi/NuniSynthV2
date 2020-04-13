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
        const key = e.keyCode
        if (keyset.has(key)){ 
            
            if (keydown) {
                if (heldKeyArray.indexOf(key) >= 0) return;
                heldKeyArray.push(key)
            } else {
                heldKeyArray.splice(heldKeyArray.indexOf(key),1)
            }
            
            G.nodes.forEach(node => {
                const an = node.audioNode
                if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
                    an.update(keydown, key)
                }
            })
        }
    }
}




// function keyboardify(node : NuniGraphNode)
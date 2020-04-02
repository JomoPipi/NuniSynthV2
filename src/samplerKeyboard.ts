
const channelOutputs = [] as NuniGraphNode[]

{
    const chooseBtn = D('choose-sampler-outputs')!
    const { canvas, nodeRadius } = GraphCanvas // we're going to hijack it's handlers

    const super_onmousedown = canvas.onmousedown
    const super_onmousemove = canvas.onmousemove

    chooseBtn.onclick = function() {
        const enable = chooseBtn.classList.toggle('selected')
        
        if (enable) 
        {
            canvas.onmousemove = null
            canvas.onmousedown = function (e) {
                const W = canvas.width
                const H = canvas.height
                const nodes = G.nodes
                const [x,y] = [e.clientX, e.clientY]

                for (const node of nodes) 

                    if (((x-node.x*W)**2 + (y-node.y*H)**2)**0.5 < nodeRadius) {
                        if (!SupportsInputChannels[node.type]) return;
                        const idx = channelOutputs.indexOf(node)
                        if (idx >= 0) 
                        {
                            channelOutputs.splice(idx,1)
                        }
                        else
                        {
                            channelOutputs.push(node)
                        }
                        GraphCanvas.render({ selectedNodes: channelOutputs })
                        return
                    }
            }
            GraphCanvas.render({ selectedNodes: channelOutputs })
        } 
        else 
        {
            canvas.onmousemove = super_onmousemove
            canvas.onmousedown = super_onmousedown
            GraphCanvas.render()
        }
    }
}







// plug into the filter
// {"0":[Āidă8,"connectiĎTypeăČhaďel"}]ċ3ăą"ćă0ċčĞĒĔnĖĘĚcĜĞĠĢċ4ĦĆĈ:3ĬĎĐįĕėę:"frequencyġģ"5ļĨľ4ŁĮēŅĳňĵĝĐĸŔ8ŗĩĿśŃŝıņĴĶţœ}:ŴħŨī"tŮňgain"ċxĪ.5ċŒ:0.12Ɔ"audĔParamValŎsăĀŽſƄ5}},ĽăŀŹŻŉilterƁ"ƃƉ.401766004415Ƹ1ƾƇƄ3477321814ƍ4859ƎƐƒoNodeĲŇ"lowpasƝċǘƓƕƗƙƛeƝ:ĀŊŌŎŐƈ19ǔ.8ƽǾǿ0ǖċQă-2ƅȀȉƽ1ċƠƀƵƎǝtuĐĪƤƦŘăŚƪş"ȎƲƴƊǂƻ2ƍ1655629ǐǆƵ494Ƽƾ3ǹȨƿ2ĊƏƑǫƖƘƚƜƞȞžȏ2ǾȗƧ:ƎźȝoscƭlatoƱƂƢƌǐƌǽ35ǌƽȻƈƊ7ǐ90Ⱥ0Ǌ7ɟ7ȻǪǚǜǞƫsſęǩȽoƔȿǮɂǲŉŋōŏőƨ2ċȒȔŇ0ɉș:ȻɍǠǝɓŒɘȐ9Ƽ26ȱƽȤƍʆ"ɣ.ǈȩ72ɞǑ1ȧ630ǗɹɻǭɁǰɃʒayTimʊƅƤ]

const TR2 = 2 ** (1.0 / 12.0)
const keys = [...`1234567890qwertyuiopasdfghjklzxcvbnm`.toUpperCase()]
const keyStates = keys.reduce((a : {[v:string]:boolean},v) => (a[v] = false, a), {})
let theAudioBuffer : AudioBuffer
const sources = keys.map((key,i) => {
    const src = audioCtx.createBufferSource()
    src.playbackRate.value =  TR2 ** (i - 12)
    return src
}) as Indexible[]
function errStuff(err:string) {
    D('record')!.innerHTML = err
    D('record')!.style.backgroundColor = 'red'
}
function clearBuffer(i : number) {
    sources[i].disconnect()
    sources[i] = audioCtx.createBufferSource()
    sources[i].playbackRate.value = TR2 ** (i - 12)
    sources[i].buffer = theAudioBuffer
    sources[i].loop = true
    sources[i].start()
}
function newBuffer(_:any, i:number) {
    const src = sources[i] 

    channelOutputs.forEach(destination => 
        src.connect(destination.audioNode as AudioParam))

    src.isOn = true
}
let lastRequestId : number
let stopLastRecorder : Function
function record() {
    const isRecording = D('record')!.classList.toggle('recording')
    if (!isRecording) {
        clearTimeout(lastRequestId)
        stopLastRecorder()
        return;
    }
    log('recording...')

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        const audioChunks : Blob[] = [];
        mediaRecorder.addEventListener("dataavailable", (event : any) => {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
            const audioBlob = new Blob(audioChunks);
            audioBlob.arrayBuffer().then(arraybuffer => {
                audioCtx.decodeAudioData(arraybuffer, (audiobuffer : AudioBuffer) => {
                    theAudioBuffer = audiobuffer
                    sources.forEach(newBuffer)
                    D('record')!.classList.remove('recording')
                },
                    errStuff)
            }).catch(errStuff)
            
        });
        lastRequestId = setTimeout(stopLastRecorder = () => {
            mediaRecorder.stop(); 
        }, 9001);

    }).catch(errStuff)
}
D('record')!.onclick = () => record()
let lastKeyStates : string
const noteOff = clearBuffer

function noteOn(n : number) {
    if (sources[n].isOn) return;
    newBuffer(0,n)
    sources[n].isOn = true
}
function updateTones() {
    keys.forEach((key,i) => {
        if (keyStates[key]) {
            noteOn(i)
        } else{
            noteOff(i)
        }
    })
}
document.onkeydown = function(e) {
    keyStates[String.fromCharCode(e.keyCode)] = true
    const states = Object.keys(keyStates).reduce((a,v,i) => a + (keyStates[v] ? v : ''), '')
    if (states === lastKeyStates) {
        lastKeyStates = states
        return;
    }
    lastKeyStates = states
    updateTones()
}
document.onkeyup = function(e) {
    lastKeyStates = ''
    keyStates[String.fromCharCode(e.keyCode)] = false
    updateTones()
}
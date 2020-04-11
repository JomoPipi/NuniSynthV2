
let currentBufferIndex = 0

D('record')!.onclick = () => recordTo(currentBufferIndex)

function errStuff(err:string) {
    D('record')!.innerHTML = err
    D('record')!.style.backgroundColor = 'orange'
}

let lastRequestId : number
let stopLastRecorder : Function

function recordTo(index : number) {
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

                    BUFFERS[index] = audiobuffer

                    G.nodes.forEach(node => {
                        const an = node.audioNode
                        if (an instanceof SamplerNode && an.bufferIndex === index) {
                            an.refresh()
                        }
                    })

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
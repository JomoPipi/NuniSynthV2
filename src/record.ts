






const recordButton = D('record')!

let currentBufferIndex = 0
let stopLastRecorder : () => void
let lastRecorderRequestId : number

recordButton.onclick = () => recordTo(currentBufferIndex)


function errStuff(err: string) {
    recordButton.innerHTML = err
    recordButton.style.backgroundColor = 'orange'
}

function recordTo(index : number) {
    const isRecording = recordButton.classList.toggle('recording')
    if (!isRecording) {
        clearTimeout(lastRecorderRequestId)
        stopLastRecorder()
        return;
    }
    log('recording...')

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.start()

        const audioChunks : Blob[] = []
        mediaRecorder.addEventListener('dataavailable', (event : any) => {
            audioChunks.push(event.data)
        })

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks)

            audioBlob.arrayBuffer().then(arraybuffer => {
                audioCtx.decodeAudioData(arraybuffer, (audiobuffer : AudioBuffer) => {

                    BUFFERS[index] = audiobuffer

                    
                    G.nodes.forEach(({ audioNode:an }) => {
                        if (an instanceof SamplerNode && an.bufferIndex === index) {
                            an.refresh()
                        }
                    })

                    recordButton.classList.remove('recording')
                },
                errStuff)
            }).catch(errStuff)
            
        })
        stopLastRecorder = () => mediaRecorder.stop()
        lastRecorderRequestId = setTimeout(stopLastRecorder, 10000)

    }).catch(errStuff)
}
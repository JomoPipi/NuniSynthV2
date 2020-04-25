






const recordButton = D('record')!
recordButton.onclick = () => 
    recordTo(Buffers.currentIndex)


function recordTo(index : number) {
    const errStuff = (err : string) => {
        recordButton.innerHTML = err
        recordButton.style.backgroundColor = 'orange'
    }

    const isRecording = recordButton.classList.toggle('recording')
    if (!isRecording) {
        clearTimeout(Buffers.lastRecorderRequestId)
        Buffers.stopLastRecorder()
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
                audioCtx.decodeAudioData(arraybuffer)
                .then((audiobuffer : AudioBuffer) => 
                {
                    Buffers.buffers[index] = audiobuffer
                    Buffers.refreshAffectedBuffers()
                    recordButton.classList.remove('recording')
                })
                .catch(errStuff)
            })
            .catch(errStuff)
        })
        Buffers.stopLastRecorder = () => mediaRecorder.stop()
        Buffers.lastRecorderRequestId = setTimeout(Buffers.stopLastRecorder, 10000)

    }).catch(errStuff)
}
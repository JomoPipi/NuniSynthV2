






function recordTo(index : number) {
    const recordButton = D('record')!

    const errStuff = (err : string) => {
        recordButton.innerText = err
        recordButton.style.backgroundColor = 'orange'
    }

    const isRecording = recordButton.classList.toggle('recording')
    if (!isRecording) {
        clearTimeout(Buffers.lastRecorderRequestId)
        Buffers.stopLastRecorder()
        return;
    }
    
    log('recording...')

    if ((<any>D('record-mic')).checked) {
        navigator
            .mediaDevices
            .getUserMedia({ audio: true })
            .then(handleStream)
            .catch(errStuff)
    } else {
        const mediaStreamDestination = 
            audioCtx.createMediaStreamDestination();

        G.nodes
            .find(node=>node.id === 0)!
            .audioNode
            .connect(mediaStreamDestination)

        handleStream(mediaStreamDestination.stream)
    }

    function handleStream(stream : MediaStream) {
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
        Buffers.lastRecorderRequestId = 
            setTimeout(
                Buffers.stopLastRecorder, 
                Buffers.templateLength * 1000)
    }
}
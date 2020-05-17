






function recordTo(index : number) {
    const recordButton = D('record')!

    const errStuff = (err : string) => {
        recordButton.innerText = err
        recordButton.style.backgroundColor = 'orange'
    }

    const isRecording = recordButton.classList.toggle('recording')
    if (!isRecording) {
        clearTimeout(bufferController.lastRecorderRequestId)
        bufferController.stopLastRecorder()
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
            audioCtx.createMediaStreamDestination()

        const masterGain = 
            G.nodes.find(node=>node.id === 0)!.audioNode
        
        masterGain.connect(mediaStreamDestination)

        handleStream(
            mediaStreamDestination.stream,
            () => masterGain.disconnect(mediaStreamDestination))
    }

    function handleStream(stream : MediaStream, f? : Function) {
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
                    bufferController.buffers[index] = audiobuffer
                    bufferController.refreshAffectedBuffers()
                    recordButton.classList.remove('recording')
                    f && f()
                })
                .catch(errStuff)
            })
            .catch(errStuff)
        })

        bufferController.stopLastRecorder = () => mediaRecorder.stop()
        bufferController.lastRecorderRequestId = 
            setTimeout(
                bufferController.stopLastRecorder, 
                bufferController.nextBufferDuration * 1000)
    }
}
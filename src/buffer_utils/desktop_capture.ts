






import { createSelectionPrompt } from "../UI_library/components/selection_prompt.js"






const { desktopCapturer } = require('electron')

export function desktopCapture(handleStreamCallback : Function) {
    log('executing desktop capture')

    desktopCapturer
        .getSources({ types: ['window', 'screen'] })
        .then(askUserWhichSourceToUse)

    const promptContainer = D('desktop-capture-source-prompt-container')

    async function askUserWhichSourceToUse(sources : any[]) {
        console.log('sources =',sources)
        
        promptContainer.appendChild(
            createSelectionPrompt(sources.map(src => src.name)))

        window.addEventListener('click', maybeUseASource(sources, handleStreamCallback), { once: true })
    }

    function maybeUseASource(sources : any[], handleStreamCallback : Function) {
        return (e : MouseEvent) => {
            // @ts-ignore 
            const name = e.target.innerText
            const source = sources.find(src => src.name === name)
            if (source)
            {
                useSource(source, handleStreamCallback)
            }
            
            promptContainer.innerHTML = ''
        }
    }

    async function useSource(source : any, handleStreamCallback : Function) {
        let resultStream : MediaStream 
        try 
        {
            log('name =',source.name)
            const audio = 
                { mandatory: 
                    { chromeMediaSource: 'desktop'
                    , chromeMediaSourceId: source.id
                    , minWidth: 1280
                    , maxWidth: 1280
                    , minHeight: 720
                    , maxHeight: 720
                    }
                } as MediaTrackConstraints
            const video = // false
                { mandatory: 
                    { chromeMediaSource: 'desktop'
                    , chromeMediaSourceId: source.id
                    , minWidth: 1280
                    , maxWidth: 1280
                    , minHeight: 720
                    , maxHeight: 720
                    }
                } as MediaTrackConstraints
            audio.deviceId = source.deviceId
            // video.deviceId = video.deviceId
            const constraints = { audio, video }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            for (const source of stream.getAudioTracks()) 
            {
                console.log('source =',source)
            }
            handleStreamCallback(stream)
        } 
        catch (e) 
        {
            handleError(e)
        }
    }
}

// function handleStream (stream : MediaStream) {
//     console.log('stream =',stream)
//     const audio = D('myaudio') as HTMLAudioElement
//     audio.srcObject = stream
//     audio.onloadedmetadata = (e) => { 
//         log('audio is gonna play!!',e)
//         audio.play()
//     }
// }

function handleError (e : any) {
    console.log('e =',e)
}
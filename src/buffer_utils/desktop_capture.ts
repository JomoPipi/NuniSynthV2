






import { createSelectionPrompt } from "../UI_library/components/selection_prompt.js"






const { desktopCapturer } = require('electron')

export function desktopCapture(handleStreamCallback : Function) {
    console.log('Executing desktop capture..')

    desktopCapturer
        .getSources({ types: ['window', 'screen'] })
        .then(askUserWhichSourceToUse)

    const promptContainer = D('desktop-capture-source-prompt-container')

    async function askUserWhichSourceToUse(sources : any[]) {
        
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
            
            promptContainer.removeChild(promptContainer.lastElementChild!)
        }
    }

    async function useSource(source : any, handleStreamCallback : Function) {
        
        try 
        {
            const audio = 
                { mandatory: 
                    { chromeMediaSource: 'desktop'
                    , chromeMediaSourceId: source.id
                    , minWidth: 1280
                    , maxWidth: 1280
                    , minHeight: 720
                    , maxHeight: 720
                    }
                , deviceId: source.deviceId
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
            
            const constraints = { audio, video }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            
            handleStreamCallback(stream)
        } 
        catch (e) 
        {
            handleError(e)
        }
    }
}

function handleError (e : any) {
    console.log('e =',e)
}
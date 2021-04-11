






declare var ace : any

const END = 'end'

const INITIAL_CODE = 
`const SAMPLE_FRAMES = 128

class CustomProcessor extends AudioWorkletProcessor {

  constructor() {
    super();
    this.processorActive = true;
    this.port.onmessage = async (msg) => {
        if(msg.data.wasm) {

          let tick = 0; 
          if(this.wasmInstance && msg.data.livewasmreplace) {
            tick = this.wasmInstance.getTick();
          }
          this.wasmInstance = (await WebAssembly.instantiate(msg.data.wasm, {
            environment: { SAMPLERATE: msg.data.samplerate },
            env: {
              abort: () => console.log('webassembly synth abort, should not happen')
            }
          })).instance.exports;
          
          if(this.wasmInstance.setTick) {
            // check for setTick to be present for backward compatibility
            this.wasmInstance.setTick(tick);
          }
        
          this.samplebufferptr = this.wasmInstance.allocateSampleBuffer(SAMPLE_FRAMES);
          
        }
        if(msg.data.song) {
          this.song = msg.data.song;
          this.loadSong();
        }
        if(msg.data.toggleSongPlay!==undefined) {    
          this.wasmInstance.toggleSongPlay(msg.data.toggleSongPlay);
        }

        const patternsbuffer = new Uint8Array(this.wasmInstance.memory.buffer, this.patternsbufferptr, this.patternsbuffersize);
        const instrumentpatternslist = new Uint8Array(this.wasmInstance.memory.buffer, this.instrumentpatternslistptr, this.instrumentpatternslistsize);

        if(msg.data.channel!==undefined && msg.data.note!==undefined) {
          if(!this.wasmInstance.isPlaying()) {
            // Just play note
            this.wasmInstance.setChannelValue(msg.data.channel,msg.data.note);
          } else {
            // Record data to pattern
            this.wasmInstance.recordChannelValue(msg.data.channel,msg.data.note);

            const quantizedTick = Math.round(this.wasmInstance.getTick());
            const patternIndex = Math.floor(quantizedTick / this.patternsize) % this.songlength;  
            const patternNoteIndex = quantizedTick % this.patternsize;

            const currentInstrumentPatternIndex = msg.data.channel * this.songlength + patternIndex;
            
            let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];
            
            if(patternNo === 0) {
              patternNo = (this.availablePatternIndex ++);
              instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
            }
            if(msg.data.note > 0) {
              patternsbuffer[patternNo * this.patternsize + patternNoteIndex]  = msg.data.note;
            }

            // send pattern back to main thread for storing
            this.port.postMessage({
              instrumentPatternIndex: patternIndex,
              channel: msg.data.channel,
              recordedPatternNo: patternNo,
              patternData: Array.from(patternsbuffer.slice(
                    patternNo * this.patternsize,
                    patternNo * this.patternsize + this.patternsize
                  )
                )
            });
          }
        }
        
        if(msg.data.clearpattern && msg.data.patternIndex !== undefined) {
          for(let n = 0;n<this.patternsize; n++) {
            patternsbuffer[msg.data.patternIndex * this.patternsize + n]  = 0; 
          }
        }

        if(msg.data.getNoteStatus) {
          if(this.wasmInstance) {
            const channelvaluesbuffer = new Float32Array(this.wasmInstance.memory.buffer, 
              this.wasmInstance.getCurrentChannelValuesBufferPtr(),
              this.song.instrumentPatternLists.length);
            const holdchannelvalues = new Float32Array(this.wasmInstance.memory.buffer, 
                    this.wasmInstance.getHoldChannelValuesBufferPtr(),
                    this.song.instrumentPatternLists.length);
            let checksum = 0;
            for(let n=0;n<channelvaluesbuffer.length;n++) {
              checksum += channelvaluesbuffer[n];
              if(channelvaluesbuffer[n]===1) {
                console.log('hold', n);
              }
            }

            if(checksum > 0 && this.channelvalueschecksum !== checksum) {
              this.port.postMessage({channelvalues: channelvaluesbuffer});
            }
            this.channelvalueschecksum = checksum;            

            // Create holding note patterns if notes are held
            for(let channel = 0; channel < holdchannelvalues.length; channel++) {
              if (holdchannelvalues[channel] > 1) {
                const quantizedTick = Math.round(this.wasmInstance.getTick());
                const patternIndex = Math.floor(quantizedTick / this.patternsize);  

                const currentInstrumentPatternIndex = channel * this.songlength + patternIndex;
                let patternNo = instrumentpatternslist[currentInstrumentPatternIndex];

                if(patternNo === 0) {
                  patternNo = (this.availablePatternIndex ++);
                  instrumentpatternslist[currentInstrumentPatternIndex] = patternNo;
                }
                // send pattern back to main thread for storing
                this.port.postMessage({
                  instrumentPatternIndex: patternIndex,
                  channel: channel,
                  recordedPatternNo: patternNo,
                  patternData: Array.from(patternsbuffer.slice(
                        patternNo * this.patternsize,
                        patternNo * this.patternsize + this.patternsize
                      )
                    )
                });
              
              }
            }
          }
        }
        if (msg.data.songPositionMillis) {
            throw 'it is truthy'
          if (this.wasmInstance)
          {
            console.log('wasm instance is defined!')
            throw 'it is truthy'
            this.wasmInstance.setMilliSecondPosition(msg.data.songPositionMillis);
          }
          else throw 'wasmInstance not defined yet'
        }
        if (msg.data === 'end') {
          this.processorActive = false;
        }
    };
    this.port.start();
    
  }  

  loadSong() {
    this.patternsize = this.song.patterns[0].length;
    
    const extrapatterns = 100;
    this.patternsbuffersize = (this.song.patterns.length + extrapatterns) * this.patternsize;
    this.patternsbufferptr = this.wasmInstance.allocatePatterns(this.song.patterns.length + extrapatterns);
    const patternsbuffer = new Uint8Array(this.wasmInstance.memory.buffer, this.patternsbufferptr,
        this.patternsbuffersize);
    
    this.song.patterns.splice(0, 0, new Array(this.patternsize).fill(0));
    this.availablePatternIndex = this.song.patterns.length;
  
    for(let patternIndex = 0; patternIndex < this.song.patterns.length; patternIndex++) {
      for(let n = 0;n<this.patternsize; n++) {
        patternsbuffer[patternIndex * this.patternsize + n] = this.song.patterns[patternIndex][n];
      }
    }
  
    this.songlength = this.song.instrumentPatternLists[0].length;
  
    this.instrumentpatternslistptr = this.wasmInstance.allocateInstrumentPatternList(this.songlength, this.song.instrumentPatternLists.length);
    this.instrumentpatternslistsize = this.song.instrumentPatternLists.length * this.songlength;
    const instrumentpatternslist = new Uint8Array(this.wasmInstance.memory.buffer, 
        this.instrumentpatternslistptr,
        this.instrumentpatternslistsize);  
  
    for(let instrIndex = 0;
          instrIndex < this.song.instrumentPatternLists.length; 
          instrIndex++) {
      for(let n=0;n<this.songlength;n++) {
        instrumentpatternslist[instrIndex*this.songlength + n] =
          this.song.instrumentPatternLists[instrIndex][n];
          
      }
    }
    this.wasmInstance.setBPM(this.song.BPM ? this.song.BPM : 120);
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    
    if(this.wasmInstance) {
      this.wasmInstance.fillSampleBuffer();
      output[0].set(new Float32Array(this.wasmInstance.memory.buffer,
        this.samplebufferptr,
        SAMPLE_FRAMES));
      output[1].set(new Float32Array(this.wasmInstance.memory.buffer,
        this.samplebufferptr + (SAMPLE_FRAMES * 4),
        SAMPLE_FRAMES));      
    }
  
    return this.processorActive;
  }
}`
//! OLD CODE:
// `class CustomProcessor extends AudioWorkletProcessor {
//   static get parameterDescriptors() {
//     return [{ name: 'gain', defaultValue: 0.1}]
//   }
//   constructor() {
//     super()
//     this.sampleRate = 44100
//     this.isRunning = true
//     this.port.onmessage = (e) => {
//     switch (e.data) {
//       case '${END}': 
//       this.isRunning = false
//       break
//     }
//   }
// }
//   process(inputs, outputs, parameters) {
    
    
//     // USER CODING AREA:
//     const speakers = outputs[0]
//     for (let i = 0; i < speakers[0].length; ++i)
//     {
//       const noise = Math.sin(Date.now()/(1+i/500))
//       const gain = parameters.gain[0]
//       speakers[0][i] = speakers[1][i] = noise * gain
//     }
//     // MESS WITH ANYTHING ELSE AT YOUR OWN RISK.
    
    
//     return this.isRunning
//   }
// }`

// const noise = Math.sin(this.x++/(((this.y *= 1.0001) % 100) + 694.0));

class CustomAudioNode extends AudioWorkletNode {
    constructor(audioContext : AudioContext, processorName : string) {
        super (audioContext, processorName, 
            { numberOfInputs: 1
            , numberOfOutputs: 1
            , outputChannelCount: [2]
            });
    }
}

// const WASM = { instance: undefined }
// WebAssembly.instantiateStreaming(fetch('song.wasm'), importObject)
//     .then(results => {
//         WASM.instance = results.instance.exports
//         console.log('wasm instance = ', WASM.instance)
//     })

export class ProcessorNode 
    implements AudioNodeInterfaces<NodeTypes.PROCESSOR> {

    audioWorkletNode : AudioWorkletNode
    inputChannelNode : GainNode
    _processorCode = INITIAL_CODE
    private ctx : AudioContext
    private volumeNode : GainNode
    private editor? : any
    private controller? : HTMLDivElement
    private url = ''

    constructor (ctx : AudioContext) {
        this.audioWorkletNode = new AudioWorkletNode(ctx, 'bypass-processor')
        this.inputChannelNode = ctx.createGain()//.connect(this.audioWorkletNode) as GainNode
        this.ctx = ctx
        this.volumeNode = ctx.createGain()
        this.audioWorkletNode.connect(this.volumeNode)
        this.getController()
    }

    connect(destination : Destination) {
        this.volumeNode.connect(destination as any)
    }

    disconnect(destination? : Destination) {
        this.volumeNode.disconnect(destination as any)
    }

    keydown(){}

    updateBoxDimensions(H : number, W : number) {
        this.controller!.style.height = Math.max(0, H - 25) +'px'
        this.controller!.style.width =  W +'px'
        this.editor?.resize()
    }

    getController() {
        if (this.controller) return this.controller

        const div = this.controller = E('div', { className: 'editor-box' })
        const topRow = E('div')
        const codeEditor = E('div', { className: 'editor' })
        const codeEditorBox = E('div', { className: 'editor-container', children: [codeEditor] })
        div.style.width = '486px'
        div.style.height = '300px'
        div.innerHTML = `
        <style>
            .editor-box {
                display: grid;
                grid-template-rows: 25px auto;
                height: 100%;
            }
            .editor-container {
                overflow-y: scroll;
            }
            .editor {
                width: 100%;
                height: 100%;
            }
        </style>`
        div.append(topRow, codeEditorBox)
   
        // We need to wait for the innerHTML to be parsed:
        requestAnimationFrame(() => {

            const options = 
                { showPrintMargin: false
                , fontFamily: 'Lucida Console'
                , maxLines: Infinity
                , tabSize: 2
                , wrap: true
                // showGutter: false
                }
            this.editor = ace.edit(codeEditor, options)

            const run = E('button', { text: 'Run', className: 'push-button' })
                run.onclick = this.playAudio.bind(this)

            topRow.append(run)

            this.editor.setTheme("ace/theme/gruvbox")
            this.editor.getSession().setMode("ace/mode/javascript")
            this.editor.getSession().setValue(this._processorCode)

        })

        return div
    }

    private static _id = 0
    private createNewCodeId() { return ProcessorNode._id++ }

    set processorCode(code : string) {
        this._processorCode = code
        if (this.editor)
        {
            this.editor.getSession().setValue(code)
        }
        else
        {
            this.sendToAudioWorklet()
        }
    }

    get processorCode() { return this._processorCode }
    
    playAudio() {
        this.runEditorCode()
    }

    runEditorCode() {
        this._processorCode = this.editor.getSession().getValue()
        this.sendToAudioWorklet()
    }

    sendToAudioWorklet() {
        const id = this.createNewCodeId().toString()
        const code = createProcessorCode(this._processorCode, id)
        const blob = new Blob([code], { type: 'application/javascript' })
        this.url = window.URL.createObjectURL(blob)
        this.runAudioWorklet(id)
    }
    
    async runAudioWorklet(processorName : string) {
        this.audioWorkletNode.port.postMessage(END)
        await this.ctx.audioWorklet.addModule(this.url)
        this.audioWorkletNode.disconnect()
        this.audioWorkletNode = new CustomAudioNode(this.ctx, processorName)
        this.audioWorkletNode.connect(this.volumeNode)
        this.inputChannelNode.connect(this.audioWorkletNode)
        
        const bytes = await fetch('song.wasm')
            .then(r => r.arrayBuffer())

        this.audioWorkletNode.port.postMessage({ topic: "wasm", 
            samplerate: this.ctx.sampleRate, 
            wasm: bytes, 
            toggleSongPlay: true
        })

        // this.audioWorkletNode.port.postMessage(
        //   { songPositionMillis: this.ctx.currentTime * 2000 | 0 })
    }
}
;(<any>window).CustomAudioNode = CustomAudioNode

function createProcessorCode(userCode : string, processorName : string) {
    return `${userCode}

    registerProcessor("${processorName}", CustomProcessor)`;
}
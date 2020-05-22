






// export class KeyboardController {
//     private readonly g : NuniGraph
//     private keycodes : number[]
//     private keymap : Indexable<number>
//     private heldKeyOrder : number[]
//     poly_n : number
//     sourceIsBusy : boolean[]
//     keyUsesWhatSource : Indexable<number>

//     constructor(g : NuniGraph) {
//         this.g = g

//         this.keycodes = ([] as number[]).concat(...[
//             '1234567890',
//             'qwertyuiop',
//             'asdfghjkl',
//             'zxcvbnm'
//             ].map((s,i) => 
//                 [...s.toUpperCase()].map(c => c.charCodeAt(0))
//                     .concat([ // add the [];',./ (aka {}:"<>?) keyCodes
//                         [189,187],
//                         [219,221],
//                         [186,222],
//                         [188,190,191]
//                     ][i]) // some of these keyCodes might not work in browsers such as FireFox.
//                 ))
        
//         this.keymap = this.keycodes.reduce((map,key,i) => {
//             map[key] = i
//             return map
//         }, {} as Indexable<number>)

//         this.heldKeyOrder = []

//         this.poly_n = 1
//         this.sourceIsBusy = [false,false]
//         this.keyUsesWhatSource = {}

//         // document.onkeydown = this.updateKeys(true)
//         // document.onkeyup = this.updateKeys(false)
        
//     }
    
//     * connectedNodes() {
//         for (const { audioNode: an } of this.g.nodes) {
//             if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
//                 yield an
//             }
//         }
//     }

//     setNPhony(phony_n : number) {
//         for (const nuniSourceNode of this.connectedNodes()) {
//             // nuniSourceNode.setNPhony(phony_n)
//         }
//     }

//     updateConnectedNodes(keydown : boolean, key : number, sourceIndex : number) {
//         for (const an of this.connectedNodes()) {
//             an.update(keydown, key, sourceIndex)
//         }
//     }
    
//     updateKeys(keydown : boolean) {
//         return ({ keyCode } : KeyboardEvent) => {
//             const key = this.keymap[keyCode]
//             if (key != undefined){ 

//                 // Maybe only do this when the keyboard image is visible?
//                 // TODO: make it match what it actually plays
//                 // updateKBImage(key, keydown)

//                 // UPDATE HELD-KEY ARRAY 
//                 // Sets up last-note priority, and prevents event spamming when keys are held.
//                 const held = this.heldKeyOrder
//                 const idx = held.indexOf(key)
//                 if (keydown) {
//                     if (idx >= 0) return;
//                     held.push(key)
//                 } else {
//                     held.splice(idx,1)
//                     if (idx !== held.length && this.poly_n === 1) {
//                         // We are lifting a note that wasnt the last, 
//                         // and we're usiing last node priority.
//                         return;
//                     }
//                 }

//                 const busySourceIndex = this.keyUsesWhatSource[key]
//                 if (busySourceIndex != undefined) {
//                     // remove it
//                     this.updateConnectedNodes(false, key, busySourceIndex)
//                     this.sourceIsBusy[busySourceIndex] = false
//                     if (keydown === false) return;
//                 }
                
//                 let sourceIndex = undefined
//                 for (let i = 0; i < this.poly_n + 1; i++) {
//                     if (this.sourceIsBusy[i] === false) {
//                         sourceIndex = i
//                         break;
//                     }
//                 }

//                 if (sourceIndex == undefined) {
//                     // All the sources are busy, interrupt the oldest one
//                     sourceIndex = this.keyUsesWhatSource[this.heldKeyOrder[0]]

//                 }

//                 // MAKE THE SOUND HAPPEN
//                 this.updateConnectedNodes(keydown, key, sourceIndex)
//             } else {
//                 // TODO: implement key-hold, or something.
//                 log('keyCode =', key)
//             }
//         }
//     }
// }
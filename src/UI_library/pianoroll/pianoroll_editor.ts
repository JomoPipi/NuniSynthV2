






// const defaultProperties = {
//     width:              {value:640, observer:'layout'},
//     height:             {value:320, observer:'layout'},
//     timebase:           {value:16, observer:'layout'},
//     editmode:           {value:"dragpoly"},
//     xrange:             {value:16, observer:'layout'},
//     yrange:             {value:16, observer:'layout'},
//     xoffset:            {value:0, observer:'layout'},
//     yoffset:            {value:60, observer:'layout'},
//     grid:               {value:4},
//     snap:               {value:1},
//     wheelzoom:          {value:0},
//     wheelzoomx:         {value:0},
//     wheelzoomy:         {value:0},
//     xscroll:            {value:0},
//     yscroll:            {value:0},
//     gridnoteratio:      {value:0.5, observer:'updateTimer'},
//     xruler:             {value:24, observer:'layout'},
//     yruler:             {value:24, observer:'layout'},
//     octadj:             {value:-1},
//     cursor:             {value:0, observer:'redrawMarker'},
//     markstart:          {value:0, observer:'redrawMarker'},
//     markend:            {value:16, observer:'redrawMarker'},
//     defvelo:            {value:100},
//     collt:              {value:"#ccc"},
//     coldk:              {value:"#aaa"},
//     colgrid:            {value:"#666"},
//     colnote:            {value:"#f22"},
//     colnotesel:         {value:"#0f0"},
//     colnoteborder:      {value:"#000"},
//     colnoteselborder:   {value:"#fff"},
//     colrulerbg:         {value:"#666"},
//     colrulerfg:         {value:"#fff"},
//     colrulerborder:     {value:"#000"},
//     colselarea:         {value:"rgba(0,0,0,0.3)"},
//     bgsrc:              {value:null, observer:'layout'},
//     cursorsrc:          {value:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIj4NCjxwYXRoIGZpbGw9InJnYmEoMjU1LDEwMCwxMDAsMC44KSIgZD0iTTAsMSAyNCwxMiAwLDIzIHoiLz4NCjwvc3ZnPg0K"},
//     cursoroffset:       {value:0},
//     markstartsrc:       {value:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAwLDIzIHoiLz4NCjwvc3ZnPg0K"},
//     markstartoffset:    {value:0},
//     markendsrc:         {value:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCjxwYXRoIGZpbGw9IiMwYzAiIGQ9Ik0wLDEgMjQsMSAyNCwyMyB6Ii8+DQo8L3N2Zz4NCg=="},
//     markendoffset:      {value:-24},
//     kbsrc:              {value:"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSI0ODAiPg0KPHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBkPSJNMCwwIGgyNHY0ODBoLTI0eiIvPg0KPHBhdGggZmlsbD0iIzAwMCIgZD0iTTAsNDAgaDEydjQwaC0xMnogTTAsMTIwIGgxMnY0MGgtMTJ6IE0wLDIwMCBoMTJ2NDBoLTEyeiBNMCwzMjAgaDEydjQwaC0xMnogTTAsNDAwIGgxMnY0MGgtMTJ6Ii8+DQo8cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIGQ9Ik0wLDYwIGgyNCBNMCwxNDAgaDI0IE0wLDIyMCBoMjQgTTAsMjgwIGgyNCBNMCwzNDAgaDI0IE0wLDQyMCBoMjQiLz4NCjwvc3ZnPg0K", observer:'layout'},
//     kbwidth:            {value:40},
//     loop:               {value:0},
//     preload:            {value:1.0},
//     tempo:              {value:120, observer:'updateTimer'},
//     enable:             {value:true}
// } as Record<any, { value: any, observer? : string }>

// export class PianorollEditor {
    
//     root : HTMLElement
//     [key : string] : any

//     constructor() {
//         this.root = E('div')
//         this.defineProps()
//         this.root.innerHTML = `
// <style>
// .pianoroll{
//     background:#ccc;
// }
// :host {
//     user-select: none;
//     display: inline-block;
//     font-family: sans-serif;
//     font-size: 11px;
//     padding:0;
//     margin:0;
// }
// #wac-body {
//     position: relative;
//     margin:0;
//     padding:0;
//     width: 100%;
//     height: 100%;
//     overflow: hidden;
// }
// #wac-pianoroll {
//     cursor: pointer;
//     margin:0;
//     padding:0;
//     width: 100%;
//     height: 100%;
//     background-size:100% calc(100%*12/16);
//     background-position:left bottom;
// }
// #wac-menu {
//     display:none;
//     position:absolute;
//     top:0px;
//     left:0px;
//     background:#eef;
//     color:#000;
//     padding:2px 10px;
//     border:1px solid #66f;
//     border-radius: 4px;
//     cursor:pointer;
// }
// .marker{
//     position: absolute;
//     left:0px;
//     top:0px;
//     cursor:ew-resize;
// }
// #wac-kb{
//     position:absolute;
//     left:0px;
//     top:0px;
//     width:100px;
//     height:100%;
//     background: repeat-y;
//     background-size:100% calc(100%*12/16);
//     background-position:left bottom;
// }
// </style>
// <div class="wac-body" id="wac-body" touch-action="none">
// <canvas id="wac-pianoroll" touch-action="none" tabindex="0"></canvas>
// <div id="wac-kb"></div>
// <img id="wac-markstart" class="marker" src="${this.markstartsrc}"/>
// <img id="wac-markend" class="marker" src="${this.markendsrc}"/>
// <img id="wac-cursor" class="marker" src="${this.cursorsrc}"/>
// <div id="wac-menu">Delete</div>
// </div>`
//         this.ready()
//     }

//     sortSequence() {
//         this.sequence.sort((x:any,y:any) => x.t-y.t)
//     }
    
//     findNextEv=function(tick){
//         for(let i=0;i<this.sequence.length;++i){
//             const nev=this.sequence[i];
//             if(nev.t>=this.markend)
//                 return {t1:tick,n2:this.markend,dt:this.markend-tick,i:-1};
//             if(nev.t>=tick)
//                 return {t1:tick,t2:nev.t,dt:nev.t-tick,i:i};
//         }
//         return {t1:tick,t2:this.markend,dt:this.markend-tick,i:-1};
//     }

//     defineProps() {
//         for (const k in defaultProperties)
//         {
//             const v = defaultProperties[k]
//             this["_" + k] = this.getAttr(k, v.value)
//             Object.defineProperty(this, k, {
//                 get: () => this["_" + k],
//                 set: val => {
//                     this["_" + k] = val
//                     if (typeof this[v.observer!] === "function")
//                     {
//                         this[v.observer!]()
//                     }
//                 }
//             })
//         }        
//     }

//     getAttr(n : string | number, value : any) {
//         let v=this.getAttribute(n)
//         if (v=="" || v==null) return value
//         if (typeof value === "number")
//         {
//             if (v == "true") return 1
//             v = +v
//             if (isNaN(v)) return 0
//             return v
//         }
//         return v
//     }

// }


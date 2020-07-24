






// create File menu (uses itemClicked event)
// var menuFile = new wijmo.input.Menu('#menu-file', {
//     header: 'File',
//     displayMemberPath: 'header',
//     subItemsPath: 'items',
//     itemsSource: getFileMenuItems(),
//     itemClicked: function (s, e) {
//         target.innerHTML = 'Thank you for clicking <b><i>' + s.text + '</i></b>!';
//     }
// });
/////////////////////////////////////////////////////////////////////
// type MenuItem = {
//     text : string
//     items : MenuItem[]
//     onclick? : Function
//     }

// type HierarchicalMenuOptions = {
//     items : MenuItem[]
//     }

// class HierarchicalMenu {
//     root : HTMLElement
//     items : MenuItem[]
//     private currentPath = []

//     constructor(id : string, { items } : HierarchicalMenuOptions) {
//         this.root = D(id) as HTMLElement
//         if (this.root.onclick) throw 'This Element already has a click event'
//         this.items = items
//         this.root.onclick = () => this.toggleItems()
//     }

//     private toggleItems() {
//         const path = this.currentPath.length ? [] : [0]
//         this.showItems(path)
//     }

//     private showItems(path : number[]) {
//         if (!path.length) {

//         }
//     }

// }

// const _ = (text : string, items : MenuItem[], onclick? : Function) => 
//     ({ text, items, onclick })

// const items = [
//     _('project', 
//         [ _('new project', [])
//         , _('recent', [])
//         , _('examples', []) 
//         ]
//     ),
//     _('settings',
//         [ _('display', [])
//         , _('audio', [])
//         , _('language', [])
//         ]
//     )
// ]
// const H = new HierarchicalMenu('file-menu', { items })
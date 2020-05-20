






function pageGroupify(parent : HTMLElement, pageIds : string[]) {
    D(pageIds[0]+'-btn')!.classList.add('selected')
    parent.onclick = (e : MouseEvent) => {
        if (e.target === parent) return;
        
        for (const pageId of pageIds) {
            const page = D(pageId)!
            const btn = D(pageId + '-btn')!
            const isTarget = e.target === btn
            
            btn.classList.toggle('selected', isTarget)
            page.classList.toggle('show', isTarget)
        }
    }
}
export function pageGroupify(parent, pageIds) {
    D(pageIds[0] + '-btn').classList.add('selected');
    parent.onclick = (e) => {
        if (e.target === parent)
            return;
        for (const pageId of pageIds) {
            const page = D(pageId);
            const btn = D(pageId + '-btn');
            const isTarget = e.target === btn;
            btn.classList.toggle('selected', isTarget);
            page.classList.toggle('show', isTarget);
        }
    };
}
//# sourceMappingURL=page_groupify.js.map







function refreshKeys() {
    for (const { audioNode: an } of G.nodes) {
        if (an instanceof NuniSourceNode && an.kbMode !== 'none') {
            an.refresh()
        }
    }
}
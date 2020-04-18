






// Switch tabs
D('tab-swapper')!.oninput = function() {
    const value = (D('tab-swapper') as HTMLSelectElement).value
    for (const { id, classList } of document.getElementsByClassName('tab')) {
        classList.toggle('show', value === id)
    }
    resizeHandler()
}
D('node-options')!.classList.toggle('show',true)

// Help the user
D('about')!.onclick = () =>
    window.open('https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect','_blank')
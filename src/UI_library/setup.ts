






import { pageGroupify } from "./components/page_groupify.js"







// Group tab-swappers with their tabs
// TODO: remove this and put all the frequently used things on one tab
pageGroupify(D('tab-swapper'), [
    'graph-tab',
    'keyboard-tab',
    'buffer-edit-tab',
    'waveform-edit-tab',
    ])

pageGroupify(D('scale-kinds'), [
    'preset-library',
    'scale-builder'
    ])

pageGroupify(D('buffer-edit-create-select'), [
    'buffer-create',
    'buffer-edit'
    ])




// Set up the info menu
{
    const container = D('info-menu-container')
    const infoBtns = 
        [...document.querySelectorAll('._info-menu-button_')] as HTMLButtonElement[]

    // D('info-button').onclick = () => {
    //     const showMenu = container.classList.toggle('show')
    //     container.onclick = showMenu ? clickInsideContainer : null
    // }

    function clickInsideContainer(e : MouseEvent) {
        const clickedElement = e.target
        if (clickedElement === container) 
        {
            container.classList.toggle('show')
            return;
        }
        if (!infoBtns.includes(clickedElement as HTMLButtonElement)) 
        {
            return;
        }
        for (const btn of infoBtns) 
        {
            const wasClicked = clickedElement === btn
            const infoTab = D(btn.value)

            btn.classList.toggle('active-info-button', wasClicked)
            infoTab.classList.toggle('show', wasClicked)
        }
    }
}




// Insert the keyboard image:
// The image that shows the user what keys are being pressed. 
// It's here so that it doesn't clutter index.html.
// Taken from a JsFiddle.
D('keyboard-image').innerHTML = `<div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49">  <div>!</div>  <div>1</div></div><div class="key--double" data-key="50">  <div>@</div>  <div>2</div></div><div class="key--double" data-key="51">  <div>#</div>  <div>3</div></div><div class="key--double" data-key="52">  <div>$</div>  <div>4</div></div><div class="key--double" data-key="53">  <div>%</div>  <div>5</div></div><div class="key--double" data-key="54">  <div>^</div>  <div>6</div></div><div class="key--double" data-key="55">  <div>&</div>  <div>7</div></div><div class="key--double" data-key="56">  <div>*</div>  <div>8</div></div><div class="key--double" data-key="57">  <div>(</div>  <div>9</div></div><div class="key--double" data-key="48">  <div>)</div>  <div>0</div></div><div class="key--double" data-key="189">  <div>_</div>  <div>-</div></div><div class="key--double" data-key="187">  <div>+</div>  <div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w4" data-key="9"></div><div class="key--letter" data-char="Q">Q</div><div class="key--letter" data-char="W">W</div><div class="key--letter" data-char="E">E</div><div class="key--letter" data-char="R">R</div><div class="key--letter" data-char="T">T</div><div class="key--letter" data-char="Y">Y</div><div class="key--letter" data-char="U">U</div><div class="key--letter" data-char="I">I</div><div class="key--letter" data-char="O">O</div><div class="key--letter" data-char="P">P</div><div class="key--double" data-key="219" data-char="{[">  <div>{</div>  <div>[</div></div><div class="key--double" data-key="221" data-char="}]">  <div>}</div>  <div>]</div></div><div class="key--double" data-key="220" data-char="|"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w5" data-key="20"></div><div class="key--letter" data-char="A">A</div><div class="key--letter" data-char="S">S</div><div class="key--letter" data-char="D">D</div><div class="key--letter" data-char="F">F</div><div class="key--letter" data-char="G">G</div><div class="key--letter" data-char="H">H</div><div class="key--letter" data-char="J">J</div><div class="key--letter" data-char="K">K</div><div class="key--letter" data-char="L">L</div><div class="key--double" data-key="186">  <div>:</div>  <div>;</div></div><div class="key--double" data-key="222">  <div>"</div>  <div>'</div></div><div class="key--bottom-right key--word key--w5" data-key="13"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w6" data-key="16"></div><div class="key--letter" data-char="Z">Z</div><div class="key--letter" data-char="X">X</div><div class="key--letter" data-char="C">C</div><div class="key--letter" data-char="V">V</div><div class="key--letter" data-char="B">B</div><div class="key--letter" data-char="N">N</div><div class="key--letter" data-char="M">M</div><div class="key--double" data-key="188">  <div>&lt;</div>  <div>,</div></div><div class="key--double" data-key="190">  <div>&gt;</div>  <div>.</div></div><div class="key--double" data-key="191">  <div>?</div>  <div>/</div></div><div class="key--bottom-right key--word key--w6" data-key="16-R"></div></div>`
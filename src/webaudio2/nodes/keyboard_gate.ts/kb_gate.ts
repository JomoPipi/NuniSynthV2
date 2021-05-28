






import { createRadioButtonGroup } from '../../../UI_library/internal.js'
import { ADSR_Executor } from '../../adsr/adsr.js'
import { KB_KEYS, KEYSTRING } from '../../constants.js'
import { VolumeNodeContainer } from '../../volumenode_container.js'

// Pitch Number Property of KeyProperties
// <checkbox "1 (no pitch)" /> <checkbox [n * 100] />
// has two checkboxes, one for no pitch (appropriate for gate/percussive instruments), and another for 
//? Or we have just the formula and a drop down list of presets (for percussion + gate)

// const kbHTML = `<div class="keyboard">
// <!-- The image that shows the user what keys are being pressed.  -->
// <div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49">  <div>!</div>  <div>1</div></div><div class="key--double" data-key="50">  <div>@</div>  <div>2</div></div><div class="key--double" data-key="51">  <div>#</div>  <div>3</div></div><div class="key--double" data-key="52">  <div>$</div>  <div>4</div></div><div class="key--double" data-key="53">  <div>%</div>  <div>5</div></div><div class="key--double" data-key="54">  <div>^</div>  <div>6</div></div><div class="key--double" data-key="55">  <div>&</div>  <div>7</div></div><div class="key--double" data-key="56">  <div>*</div>  <div>8</div></div><div class="key--double" data-key="57">  <div>(</div>  <div>9</div></div><div class="key--double" data-key="48">  <div>)</div>  <div>0</div></div><div class="key--double" data-key="189">  <div>_</div>  <div>-</div></div><div class="key--double" data-key="187">  <div>+</div>  <div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w4" data-key="9"></div><div class="key--letter" data-char="Q">Q</div><div class="key--letter" data-char="W">W</div><div class="key--letter" data-char="E">E</div><div class="key--letter" data-char="R">R</div><div class="key--letter" data-char="T">T</div><div class="key--letter" data-char="Y">Y</div><div class="key--letter" data-char="U">U</div><div class="key--letter" data-char="I">I</div><div class="key--letter" data-char="O">O</div><div class="key--letter" data-char="P">P</div><div class="key--double" data-key="219" data-char="{[">  <div>{</div>  <div>[</div></div><div class="key--double" data-key="221" data-char="}]">  <div>}</div>  <div>]</div></div><div class="key--double" data-key="220" data-char="|"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w5" data-key="20"></div><div class="key--letter" data-char="A">A</div><div class="key--letter" data-char="S">S</div><div class="key--letter" data-char="D">D</div><div class="key--letter" data-char="F">F</div><div class="key--letter" data-char="G">G</div><div class="key--letter" data-char="H">H</div><div class="key--letter" data-char="J">J</div><div class="key--letter" data-char="K">K</div><div class="key--letter" data-char="L">L</div><div class="key--double" data-key="186">  <div>:</div>  <div>;</div></div><div class="key--double" data-key="222">  <div>"</div>  <div>'</div></div><div class="key--bottom-right key--word key--w5" data-key="13"></div></div> <br><div class="keyboard__row"><div class="key--bottom-left key--word key--w6" data-key="16"></div><div class="key--letter" data-char="Z">Z</div><div class="key--letter" data-char="X">X</div><div class="key--letter" data-char="C">C</div><div class="key--letter" data-char="V">V</div><div class="key--letter" data-char="B">B</div><div class="key--letter" data-char="N">N</div><div class="key--letter" data-char="M">M</div><div class="key--double" data-key="188">  <div>&lt;</div>  <div>,</div></div><div class="key--double" data-key="190">  <div>&gt;</div>  <div>.</div></div><div class="key--double" data-key="191">  <div>?</div>  <div>/</div></div><div class="key--bottom-right key--word key--w6" data-key="16-R"></div></div>
// </div>`


// const kbHTML = `<div class="keyboard"><!-- The image that shows the user what keys are being pressed. --><div class="keyboard__row"><div class="key--double" data-key="192"></div><div class="key--double" data-key="49"><div>!</div><div>1</div></div><div class="key--double" data-key="50"><div>@</div><div>2</div></div><div class="key--double" data-key="51"><div>#</div><div>3</div></div><div class="key--double" data-key="52"><div>$</div><div>4</div></div><div class="key--double" data-key="53"><div>%</div><div>5</div></div><div class="key--double" data-key="54"><div>^</div><div>6</div></div><div class="key--double" data-key="55"><div>&</div><div>7</div></div><div class="key--double" data-key="56"><div>*</div><div>8</div></div><div class="key--double" data-key="57"><div>(</div><div>9</div></div><div class="key--double" data-key="48"><div>)</div><div>0</div></div><div class="key--double" data-key="189"><div>_</div><div>-</div></div><div class="key--double" data-key="187"><div>+</div><div>=</div></div><div class="key--bottom-right key--word key--w4" data-key="8"></div></div><div class="keyboard__row"><div class="key--bottom-left key--word key--w4" data-key="9"></div><div class="key--letter" data-char="Q">Q</div><div class="key--letter" data-char="W">W</div><div class="key--letter" data-char="E">E</div><div class="key--letter" data-char="R">R</div><div class="key--letter" data-char="T">T</div><div class="key--letter" data-char="Y">Y</div><div class="key--letter" data-char="U">U</div><div class="key--letter" data-char="I">I</div><div class="key--letter" data-char="O">O</div><div class="key--letter" data-char="P">P</div><div class="key--double" data-key="219" data-char="{["><div>{</div><div>[</div></div><div class="key--double" data-key="221" data-char="}]"><div>}</div><div>]</div></div><div class="key--double" data-key="220" data-char="|"></div></div><div class="keyboard__row"><div class="key--bottom-left key--word key--w5" data-key="20"></div><div class="key--letter" data-char="A">A</div><div class="key--letter" data-char="S">S</div><div class="key--letter" data-char="D">D</div><div class="key--letter" data-char="F">F</div><div class="key--letter" data-char="G">G</div><div class="key--letter" data-char="H">H</div><div class="key--letter" data-char="J">J</div><div class="key--letter" data-char="K">K</div><div class="key--letter" data-char="L">L</div><div class="key--double" data-key="186"><div>:</div><div>;</div></div><div class="key--double" data-key="222"><div>"</div><div>'</div></div><div class="key--bottom-right key--word key--w5" data-key="13"></div></div><div class="keyboard__row"><div class="key--bottom-left key--word key--w6" data-key="16"></div><div class="key--letter" data-char="Z">Z</div><div class="key--letter" data-char="X">X</div><div class="key--letter" data-char="C">C</div><div class="key--letter" data-char="V">V</div><div class="key--letter" data-char="B">B</div><div class="key--letter" data-char="N">N</div><div class="key--letter" data-char="M">M</div><div class="key--double" data-key="188"><div>&lt;</div><div>,</div></div><div class="key--double" data-key="190"><div>&gt;</div><div>.</div></div><div class="key--double" data-key="191"><div>?</div><div>/</div></div><div class="key--bottom-right key--word key--w6" data-key="16-R"></div></div></div>`
// const kbHTML = `<div class="keyboard"> <!-- The image that shows the user what keys are being pressed. --> <div class="keyboard__row"> <div class="key--double" data-key="192" data-not-in-use=1></div> <div class="key--double" data-key="49"> <div>!</div> <div>1</div> </div> <div class="key--double" data-key="50"> <div>@</div> <div>2</div> </div> <div class="key--double" data-key="51"> <div>#</div> <div>3</div> </div> <div class="key--double" data-key="52"> <div>$</div> <div>4</div> </div> <div class="key--double" data-key="53"> <div>%</div> <div>5</div> </div> <div class="key--double" data-key="54"> <div>^</div> <div>6</div> </div> <div class="key--double" data-key="55"> <div>&</div> <div>7</div> </div> <div class="key--double" data-key="56"> <div>*</div> <div>8</div> </div> <div class="key--double" data-key="57"> <div>(</div> <div>9</div> </div> <div class="key--double" data-key="48"> <div>)</div> <div>0</div> </div> <div class="key--double" data-key="189"> <div>_</div> <div>-</div> </div> <div class="key--double" data-key="187"> <div>+</div> <div>=</div> </div> <div class="key--bottom-right key--word key--w4" data-key="8" data-not-in-use=1></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-key="9" data-not-in-use=1></div> <div class="key--letter" data-char="Q">Q</div> <div class="key--letter" data-char="W">W</div> <div class="key--letter" data-char="E">E</div> <div class="key--letter" data-char="R">R</div> <div class="key--letter" data-char="T">T</div> <div class="key--letter" data-char="Y">Y</div> <div class="key--letter" data-char="U">U</div> <div class="key--letter" data-char="I">I</div> <div class="key--letter" data-char="O">O</div> <div class="key--letter" data-char="P">P</div> <div class="key--double" data-key="219" data-char="{["> <div>{</div> <div>[</div> </div> <div class="key--double" data-key="221" data-char="}]"> <div>}</div> <div>]</div> </div> <div class="key--double" data-key="220" data-char="|" data-not-in-use=1></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-key="20" data-not-in-use=1></div> <div class="key--letter" data-char="A">A</div> <div class="key--letter" data-char="S">S</div> <div class="key--letter" data-char="D">D</div> <div class="key--letter" data-char="F">F</div> <div class="key--letter" data-char="G">G</div> <div class="key--letter" data-char="H">H</div> <div class="key--letter" data-char="J">J</div> <div class="key--letter" data-char="K">K</div> <div class="key--letter" data-char="L">L</div> <div class="key--double" data-key="186"> <div>:</div> <div>;</div> </div> <div class="key--double" data-key="222"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-key="13" data-not-in-use=1></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-key="16" data-not-in-use=1></div> <div class="key--letter" data-char="Z">Z</div> <div class="key--letter" data-char="X">X</div> <div class="key--letter" data-char="C">C</div> <div class="key--letter" data-char="V">V</div> <div class="key--letter" data-char="B">B</div> <div class="key--letter" data-char="N">N</div> <div class="key--letter" data-char="M">M</div> <div class="key--double" data-key="188"> <div>&lt;</div> <div>,</div> </div> <div class="key--double" data-key="190"> <div>&gt;</div> <div>.</div> </div> <div class="key--double" data-key="191"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-key="16-R" data-not-in-use=1></div> </div></div>`
// const kbHTML = `<div class="keyboard"> <!-- The image that shows the user what keys are being pressed. --> <div class="keyboard__row"> <div class="key--double" data-key="192" data-not-in-use="1"></div> <div class="key--double" data-key="49" key-char="1"> <div>!</div> <div>1</div> </div> <div class="key--double" data-key="50" key-char="2"> <div>@</div> <div>2</div> </div> <div class="key--double" data-key="51" key-char="3"> <div>#</div> <div>3</div> </div> <div class="key--double" data-key="52" key-char="4"> <div>$</div> <div>4</div> </div> <div class="key--double" data-key="53" key-char="5"> <div>%</div> <div>5</div> </div> <div class="key--double" data-key="54" key-char="6"> <div>^</div> <div>6</div> </div> <div class="key--double" data-key="55" key-char="7"> <div>&amp;</div> <div>7</div> </div> <div class="key--double" data-key="56" key-char="8"> <div>*</div> <div>8</div> </div> <div class="key--double" data-key="57" key-char="9"> <div>(</div> <div>9</div> </div> <div class="key--double" data-key="48" key-char="0"> <div>)</div> <div>0</div> </div> <div class="key--double" data-key="189" key-char="-"> <div>_</div> <div>-</div> </div> <div class="key--double" data-key="187" key-char="="> <div>+</div> <div>=</div> </div> <div class="key--bottom-right key--word key--w4" data-key="8" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-key="9" data-not-in-use="1"></div> <div class="key--letter" data-char="Q" key-char="q">Q</div> <div class="key--letter" data-char="W" key-char="w">W</div> <div class="key--letter" data-char="E" key-char="e">E</div> <div class="key--letter" data-char="R" key-char="r">R</div> <div class="key--letter" data-char="T" key-char="t">T</div> <div class="key--letter" data-char="Y" key-char="y">Y</div> <div class="key--letter" data-char="U" key-char="u">U</div> <div class="key--letter" data-char="I" key-char="i">I</div> <div class="key--letter" data-char="O" key-char="o">O</div> <div class="key--letter" data-char="P" key-char="p">P</div> <div class="key--double" data-key="219" data-char="{[" key-char="["> <div>{</div> <div>[</div> </div> <div class="key--double" data-key="221" data-char="}]" key-char="]"> <div>}</div> <div>]</div> </div> <div class="key--double" data-key="220" data-char="|" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-key="20" data-not-in-use="1"></div> <div class="key--letter" data-char="A" key-char="a">A</div> <div class="key--letter" data-char="S" key-char="s">S</div> <div class="key--letter" data-char="D" key-char="d">D</div> <div class="key--letter" data-char="F" key-char="f">F</div> <div class="key--letter" data-char="G" key-char="g">G</div> <div class="key--letter" data-char="H" key-char="h">H</div> <div class="key--letter" data-char="J" key-char="j">J</div> <div class="key--letter" data-char="K" key-char="k">K</div> <div class="key--letter" data-char="L" key-char="l">L</div> <div class="key--double" data-key="186" key-char=";"> <div>:</div> <div>;</div> </div> <div class="key--double" data-key="222" key-char="'"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-key="13" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-key="16" data-not-in-use="1"></div> <div class="key--letter" data-char="Z" key-char="z">Z</div> <div class="key--letter" data-char="X" key-char="x">X</div> <div class="key--letter" data-char="C" key-char="c">C</div> <div class="key--letter" data-char="V" key-char="v">V</div> <div class="key--letter" data-char="B" key-char="b">B</div> <div class="key--letter" data-char="N" key-char="n">N</div> <div class="key--letter" data-char="M" key-char="m">M</div> <div class="key--double" data-key="188" key-char=","> <div>&lt;</div> <div>,</div> </div> <div class="key--double" data-key="190" key-char="."> <div>&gt;</div> <div>.</div> </div> <div class="key--double" data-key="191" key-char="/"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-key="16-R" data-not-in-use="1"></div> </div></div>`
// const kbHTML = `<div class="keyboard"> <!-- The image that shows the user what keys are being pressed. --> <div class="keyboard__row"> <div class="key--double" data-key="192" data-not-in-use="1"></div> <div class="key--double" data-key="49" key-char="0"> <div>!</div> <div>1</div> </div> <div class="key--double" data-key="50" key-char="1"> <div>@</div> <div>2</div> </div> <div class="key--double" data-key="51" key-char="2"> <div>#</div> <div>3</div> </div> <div class="key--double" data-key="52" key-char="3"> <div>$</div> <div>4</div> </div> <div class="key--double" data-key="53" key-char="4"> <div>%</div> <div>5</div> </div> <div class="key--double" data-key="54" key-char="5"> <div>^</div> <div>6</div> </div> <div class="key--double" data-key="55" key-char="6"> <div>&amp;</div> <div>7</div> </div> <div class="key--double" data-key="56" key-char="7"> <div>*</div> <div>8</div> </div> <div class="key--double" data-key="57" key-char="8"> <div>(</div> <div>9</div> </div> <div class="key--double" data-key="48" key-char="9"> <div>)</div> <div>0</div> </div> <div class="key--double" data-key="189" key-char="10"> <div>_</div> <div>-</div> </div> <div class="key--double" data-key="187" key-char="11"> <div>+</div> <div>=</div> </div> <div class="key--bottom-right key--word key--w4" data-key="8" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-key="9" data-not-in-use="1"></div> <div class="key--letter" data-char="Q" key-char="12">Q</div> <div class="key--letter" data-char="W" key-char="13">W</div> <div class="key--letter" data-char="E" key-char="14">E</div> <div class="key--letter" data-char="R" key-char="15">R</div> <div class="key--letter" data-char="T" key-char="16">T</div> <div class="key--letter" data-char="Y" key-char="17">Y</div> <div class="key--letter" data-char="U" key-char="18">U</div> <div class="key--letter" data-char="I" key-char="19">I</div> <div class="key--letter" data-char="O" key-char="20">O</div> <div class="key--letter" data-char="P" key-char="21">P</div> <div class="key--double" data-key="219" data-char="{[" key-char="22"> <div>{</div> <div>[</div> </div> <div class="key--double" data-key="221" data-char="}]" key-char="23"> <div>}</div> <div>]</div> </div> <div class="key--double" data-key="220" data-char="|" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-key="20" data-not-in-use="1"></div> <div class="key--letter" data-char="A" key-char="24">A</div> <div class="key--letter" data-char="S" key-char="25">S</div> <div class="key--letter" data-char="D" key-char="26">D</div> <div class="key--letter" data-char="F" key-char="27">F</div> <div class="key--letter" data-char="G" key-char="28">G</div> <div class="key--letter" data-char="H" key-char="29">H</div> <div class="key--letter" data-char="J" key-char="30">J</div> <div class="key--letter" data-char="K" key-char="31">K</div> <div class="key--letter" data-char="L" key-char="32">L</div> <div class="key--double" data-key="186" key-char="33"> <div>:</div> <div>;</div> </div> <div class="key--double" data-key="222" key-char="34"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-key="13" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-key="16" data-not-in-use="1"></div> <div class="key--letter" data-char="Z" key-char="35">Z</div> <div class="key--letter" data-char="X" key-char="36">X</div> <div class="key--letter" data-char="C" key-char="37">C</div> <div class="key--letter" data-char="V" key-char="38">V</div> <div class="key--letter" data-char="B" key-char="39">B</div> <div class="key--letter" data-char="N" key-char="40">N</div> <div class="key--letter" data-char="M" key-char="41">M</div> <div class="key--double" data-key="188" key-char="42"> <div>&lt;</div> <div>,</div> </div> <div class="key--double" data-key="190" key-char="43"> <div>&gt;</div> <div>.</div> </div> <div class="key--double" data-key="191" key-char="44"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-key="16-R" data-not-in-use="1"></div> </div></div>`
const kbHTML = `<div class="keyboard"> <!-- The image that shows the user what keys are being pressed. --> <div class="keyboard__row"> <div class="key--double" data-key="192" data-not-in-use="1"></div> <div class="key--double" data-key="49" key-char="0"> <div>!</div> <div>1</div> </div> <div class="key--double" data-key="50" key-char="1"> <div>@</div> <div>2</div> </div> <div class="key--double" data-key="51" key-char="2"> <div>#</div> <div>3</div> </div> <div class="key--double" data-key="52" key-char="3"> <div>$</div> <div>4</div> </div> <div class="key--double" data-key="53" key-char="4"> <div>%</div> <div>5</div> </div> <div class="key--double" data-key="54" key-char="5"> <div>^</div> <div>6</div> </div> <div class="key--double" data-key="55" key-char="6"> <div>&amp;</div> <div>7</div> </div> <div class="key--double" data-key="56" key-char="7"> <div>*</div> <div>8</div> </div> <div class="key--double" data-key="57" key-char="8"> <div>(</div> <div>9</div> </div> <div class="key--double" data-key="48" key-char="9"> <div>)</div> <div>0</div> </div> <div class="key--double" data-key="189" key-char="10"> <div>_</div> <div>-</div> </div> <div class="key--double" data-key="187" key-char="11"> <div>+</div> <div>=</div> </div> <div class="key--bottom-right key--word key--w4" data-key="8" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w4" data-key="9" data-not-in-use="1"></div> <div class="key--letter" data-char="Q" key-char="12">Q</div> <div class="key--letter" data-char="W" key-char="13">W</div> <div class="key--letter" data-char="E" key-char="14">E</div> <div class="key--letter" data-char="R" key-char="15">R</div> <div class="key--letter" data-char="T" key-char="16">T</div> <div class="key--letter" data-char="Y" key-char="17">Y</div> <div class="key--letter" data-char="U" key-char="18">U</div> <div class="key--letter" data-char="I" key-char="19">I</div> <div class="key--letter" data-char="O" key-char="20">O</div> <div class="key--letter" data-char="P" key-char="21">P</div> <div class="key--double" data-key="219" data-char="{[" key-char="22"> <div>{</div> <div>[</div> </div> <div class="key--double" data-key="221" data-char="}]" key-char="23"> <div>}</div> <div>]</div> </div> <div class="key--double" data-key="220" data-char="|" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w5" data-key="20" data-not-in-use="1"></div> <div class="key--letter" data-char="A" key-char="24">A</div> <div class="key--letter" data-char="S" key-char="25">S</div> <div class="key--letter" data-char="D" key-char="26">D</div> <div class="key--letter" data-char="F" key-char="27">F</div> <div class="key--letter" data-char="G" key-char="28">G</div> <div class="key--letter" data-char="H" key-char="29">H</div> <div class="key--letter" data-char="J" key-char="30">J</div> <div class="key--letter" data-char="K" key-char="31">K</div> <div class="key--letter" data-char="L" key-char="32">L</div> <div class="key--double" data-key="186" key-char="33"> <div>:</div> <div>;</div> </div> <div class="key--double" data-key="222" key-char="34"> <div>"</div> <div>'</div> </div> <div class="key--bottom-right key--word key--w5" data-key="13" data-not-in-use="1"></div> </div> <div class="keyboard__row"> <div class="key--bottom-left key--word key--w6" data-key="16" data-not-in-use="1"></div> <div class="key--letter" data-char="Z" key-char="35">Z</div> <div class="key--letter" data-char="X" key-char="36">X</div> <div class="key--letter" data-char="C" key-char="37">C</div> <div class="key--letter" data-char="V" key-char="38">V</div> <div class="key--letter" data-char="B" key-char="39">B</div> <div class="key--letter" data-char="N" key-char="40">N</div> <div class="key--letter" data-char="M" key-char="41">M</div> <div class="key--double" data-key="188" key-char="42"> <div>&lt;</div> <div>,</div> </div> <div class="key--double" data-key="190" key-char="43"> <div>&gt;</div> <div>.</div> </div> <div class="key--double" data-key="191" key-char="44"> <div>?</div> <div>/</div> </div> <div class="key--bottom-right key--word key--w6" data-key="16-R" data-not-in-use="1"></div> </div></div>`

// const innerHTML = ``

type LowerCaseKeyboardKey = string
enum TriggerModes { play='play', toggle='toggle' }//, pick }
enum EnvelopeTypes { NONE, ATTACK_ONLY, AD, ADSR }
type Envelope = { attack : number, decay : number, sustain : number, release : number, curve : CurveType }
type KeyData = ({
    triggerMode : TriggerModes.play
    envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.AD | EnvelopeTypes.ADSR
} | {
    triggerMode : TriggerModes.toggle
    envelopeType : EnvelopeTypes.NONE | EnvelopeTypes.ATTACK_ONLY
    active: false
}) & {
    gain : number // Defaults to 1, can be used for pitch
    adsr : Envelope
}
type KeyDataMap = Record<LowerCaseKeyboardKey, KeyData>

export class KeyboardGate extends VolumeNodeContainer
    implements AudioNodeInterfaces<NodeTypes.KB_GATE> {

    keyData : KeyDataMap = {}
    triggerMode = TriggerModes.play
    lastToggledKey = ''

    constructor(ctx : AudioContext) {
        super(ctx)
        this.volumeNode.gain.value = 0
    }
    
    addInput(node : NuniNode) {
        node.audioNode.connect(this.volumeNode)
    }

    removeInput(node : NuniNode) {
        node.audioNode.disconnect(this.volumeNode)
    }

    takeKeyboardInput(keydown : boolean, key : number) {
        console.log('yo yo', key, KEYSTRING[key])
        if (this.keyData[KEYSTRING[key]])
        {
            ADSR_Executor.trigger(
                this.volumeNode.gain, this.ctx.currentTime, 69420,
                { attack: 0.002, decay: 0.05, sustain: 0 })
        }
    }

    private controller? : HTMLElement
    getController() {
        if (this.controller) return this.controller
        this.controller = E('div')

        const inputSelect = E('div', { text: 'mode' }) // this.getInputSelect()
        const { keyboardBox, onchange } = this.getKeyboardComponent()
        onchange(key => console.log(key, KB_KEYS[key]))
        const topRow = E('div', { children: [inputSelect], className: 'center' })

        this.controller.append(topRow, keyboardBox)

        return this.controller
    }

    private getKeyboardComponent() {
        const keyboardBox = E('div')
            keyboardBox.innerHTML = kbHTML
            // let i = 0;
            // for (const row of keyboardBox.children[0].children)
            //     for (const key of row.children)
            //         if (!(key as HTMLElement).dataset.notInUse)
            //             key.setAttribute('key-char', (i++).toString())
            // keyboardBox.querySelectorAll('[data-foo="value"]');
            // console.log(keyboardBox.innerHTML)

        // KB Gate node:
        // 2 modes - play | toggle
        // single input & mono
        const getKey = KEYSTRING.reduce((acc,key, i) => (
            acc[key] = keyboardBox.querySelector(`[key-char='${i}']`)!,
            acc
            ), {} as Indexable<HTMLElement>)
        console.log('get key =',getKey)

        const onchange = (fn : (key : LowerCaseKeyboardKey) => void) => {
            keyboardBox.onclick = e => {
                const el = e.target as HTMLElement
                const p = el.parentElement!
                const get = (x : HTMLElement) => x.getAttribute('key-char')
                const idx = get(el) || get(p)
                if (idx)
                {
                    const char = KEYSTRING[+idx]

                    fn(char)
                    const turnOn = !(char in this.keyData)
                    getKey[char].classList.toggle('highlighted', turnOn)
                    console.log('idx,char =',idx, char)
                    if (turnOn)
                    {
                        this.keyData[char] = 
                            { triggerMode: TriggerModes.play
                            , envelopeType: EnvelopeTypes.ADSR
                            , gain: 1
                            , adsr: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3, curve: 'S' }
                            }
                    }
                    else
                    {
                        delete this.keyData[char]
                    }
                    console.log(this.keyData[char])
                }
            }
        }

        return { keyboardBox, onchange }
    }

    private assignKeyData(key : LowerCaseKeyboardKey, data : KeyData) {
        this.keyData[key] = { ...this.keyData[key], ...data }
    }
}

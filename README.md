# Welcome to NuniSynth!

Let's play with **NuniSynth**, an audio routing graph synthesizer based on the [Web Audio Api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). Working demo (use chrome on PC): https://demo-jet.now.sh

Linking together basic **audio nodes** gives us the flexibility to create various complex audio functions with dynamic effects.



# Node Types

**Gain** nodes can be used to amplify the output data from other nodes.

**Oscillator** nodes output a specified frequency of a given periodic wave.

**Filter**s can be of different [types](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode#Properties).

**Panner**s can be used to pan audio streams left or right.

**Delay** nodes cause a delay between the arrival of input data and its propagation to the output.

**Buffer** nodes allow you to play loaded or recorded samples.

# Connections
If you try to make a connection to any node besides the **master gain**, you will be asked to specify the connection type. 

**Channel** connections are used to pass sound data from the `from` node to the `to` node (the arrow points from `from` to `to`). 

Any other connection type uses the `from` node's sound data to automatically change the values of the `to` node's parameters, over time.

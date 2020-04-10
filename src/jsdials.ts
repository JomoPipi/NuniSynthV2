
class JsDial {
    [x:string]:any
    constructor(dial : Element) {
        this.isActive = false
        this.lastY = null
        this.max = 1
        this.dial = dial
        this.value = this.min = this.sensitivity = 2**-7
        ;(xs => {
            for (const attr of xs) {
                this[attr.name] = (x => isNaN(+x) ? x : +x)(attr.value)
            }
        })(dial.attributes)
    }
    
    attach(func : Function, startFunc?:Function, endFunc?:Function) {

        const start = (x:number, y:number) => { 
            this.lastX = x
            this.lastY = y
            this.isActive = true
            startFunc && startFunc()
            this.render()
        }
        const end = () => { 
            this.isActive = false
            endFunc && endFunc()
        }
        const mouseStart = (e:MouseEvent) => start(e.clientX,e.clientY)
        const mouseMove = (e:MouseEvent) => move(e.clientX,e.clientY)
        
        const move = (x:number,y:number) => {
            if (!this.isActive) return;
            this.value += (this.lastY - y + x - this.lastX) * this.sensitivity
            this.value = Math.max(this.min, Math.min(this.max, this.value))
            this.lastX = x
            this.lastY = y

            this.render()
            func(this.value)
        }

        this.dial.addEventListener('mousedown', mouseStart)
        window.addEventListener('mousemove', mouseMove)

        window.addEventListener('mouseup', end)
    }
    render() {
        const imgDegreeOffset = 195
        this.dial.style.transform = `rotate(${this.value * 320 + imgDegreeOffset}deg)`
    }

}
const MY_JS_DIALS = [...document.querySelectorAll('.js-dial')].map(dial => new JsDial(dial))

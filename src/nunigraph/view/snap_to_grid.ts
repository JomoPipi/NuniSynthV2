






const snapToGridBtn = D('snap-to-grid-btn')

// TODO: generalize the global objects with attach methods?
export const snapToGrid = 
    { isEnabled: true
    , attach: 
        (fn : (enabled? : boolean) => void) => {
            snapToGridBtn.onclick = () => {
                snapToGrid.isEnabled = !snapToGridBtn.classList.toggle('dim')
                fn(snapToGrid.isEnabled)
            }
        }
    }

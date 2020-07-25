import { GraphController } from '../nunigraph/init.js';
window.addEventListener('resize', resizeHandler);
resizeHandler();
function resizeHandler() {
    GraphController.renderer.render();
}
//# sourceMappingURL=resize.js.map
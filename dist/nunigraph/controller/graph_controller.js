import { HOVER } from '../view/graph_renderer.js';
import { NuniGraphAudioNode } from '../../webaudio2/internal.js';
import { clipboard } from './clipboard.js';
import { createDraggableWindow, UI_clamp } from '../../UI_library/internal.js';
export const ActiveControllers = [];
let openWindowGlobalIndexThatKeepsRising = 0;
export class NuniGraphController {
    constructor(g, prompt, renderer, createValuesWindow) {
        this.g = g;
        this.connectionTypePrompt = prompt;
        this.renderer = renderer;
        this.createValuesWindow = createValuesWindow;
        this.mouseIsDown = false;
        this.selectedNodes = [];
        this.lastMouse_MoveMsg =
            this.lastMouse_DownMsg =
                { type: HOVER.EMPTY };
        this.getOpenWindow = {};
        this.lastCoordsOfWindow = {};
        this.mouseHasMovedSinceLastMouseDown = false;
        this.lastMouse_DownXY = [0, 0];
        this._mouse_move = (e) => {
            const { x: offsetX, y: offsetY } = this.getMousePos(e);
            const msg = { buttons: e.buttons,
                offsetX,
                offsetY
            };
            this.mousemove(msg);
        };
        this._mouseup = (e) => this.mouseup(e);
        this._keydown = (e) => this.keydown(e);
    }
    fromString(graphCode) {
        for (const id in this.renderer.connectionsCache) {
            delete this.renderer.connectionsCache[id];
        }
        this.g.fromString(graphCode);
    }
    activateEventHandlers() {
        window.addEventListener('mousemove', this._mouse_move);
        window.addEventListener('mouseup', this._mouseup);
        window.addEventListener('keydown', this._keydown);
        this.renderer.canvas.onmousedown = e => this.mousedown(e);
        this.renderer.canvas.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        };
    }
    deactivateEventHandlers() {
        window.removeEventListener('mousemove', this._mouse_move);
        window.removeEventListener('mouseup', this._mouseup);
        window.removeEventListener('keydown', this._keydown);
        this.renderer.canvas.onmousedown = null;
        this.renderer.canvas.oncontextmenu = null;
    }
    save() {
    }
    undo() {
    }
    redo() {
    }
    showContextMenu(x, y) {
        DIRTYGLOBALS.lastControllerToOpenTheContextmenu = this;
        const menu = D('graph-contextmenu');
        menu.style.zIndex = (openWindowGlobalIndexThatKeepsRising + 1).toString();
        menu.style.display = 'grid';
        UI_clamp(x, y, menu, document.body);
    }
    hideContextMenu() {
        D('graph-contextmenu').style.display = 'none';
    }
    getMousePos(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    selectNode(node) {
        var _a;
        this.unselectNodes();
        this.selectedNodes = [node];
        (_a = this.getOpenWindow[node.id]) === null || _a === void 0 ? void 0 : _a.classList.add('selected2');
    }
    unselectNodes() {
        this.selectedNodes = [];
        for (const key in this.getOpenWindow) {
            this.getOpenWindow[key].classList.remove('selected2');
        }
    }
    closeWindow(id) {
        const node = this.g.nodes.find(({ id: _id }) => _id === id);
        if (!node)
            throw 'figure out what to do from here';
        if (node.audioNode instanceof NuniGraphAudioNode) {
            const controller = node.audioNode.controller;
            const index = ActiveControllers.indexOf(controller);
            if (index >= 0) {
                ActiveControllers.splice(index, 1);
                node.audioNode.deactivateWindow();
            }
        }
        const nodeWindow = this.getOpenWindow[id];
        if (nodeWindow) {
            this.lastCoordsOfWindow[id] = [nodeWindow.offsetLeft, nodeWindow.offsetTop];
            D('node-windows').removeChild(nodeWindow);
            delete this.getOpenWindow[id];
        }
    }
    closeAllWindows() {
        for (const nodeId in this.getOpenWindow) {
            this.closeWindow(+nodeId);
        }
    }
    deleteNode(node, options = {}) {
        const { force, noRender } = options;
        if (!force && node.INPUT_NODE_ID)
            return;
        this.connectionTypePrompt.classList.remove('show');
        this.closeWindow(node.id);
        this.renderer.removeFromConnectionsCache(node.id);
        this.g.deleteNode(node);
        this.unselectNodes();
        this.selectedNodes = [];
        if (!noRender) {
            this.renderer.render();
        }
    }
    openWindow(node) {
        const moveTheWindowToTheTop = (box) => {
            box.style.zIndex = (++openWindowGlobalIndexThatKeepsRising).toString();
        };
        if (this.getOpenWindow[node.id]) {
            moveTheWindowToTheTop(this.getOpenWindow[node.id]);
            return;
        }
        if (node.audioNode instanceof NuniGraphAudioNode) {
            const controller = node.audioNode.controller;
            if (ActiveControllers.includes(controller))
                throw 'This shouldn\'t have happened';
            ActiveControllers.push(controller);
            node.audioNode.activateWindow();
        }
        const clickCallback = (box) => {
            moveTheWindowToTheTop(box);
            if (node.type !== NodeTypes.CUSTOM) {
                this.selectNode(node);
            }
            this.renderer.render({ selectedNodes: [node] });
        };
        const closeCallback = () => {
            this.closeWindow(node.id);
        };
        const deleteCallBack = () => {
            this.save();
            this.deleteNode(node);
        };
        const titleEditor = () => {
            const input = E('input', { className: 'title-editor',
                props: { value: node.title || '' }
            });
            input.oninput = () => {
                node.title = input.value;
                this.renderer.render();
            };
            return input;
        };
        const dialogBox = createDraggableWindow({ text: `${NodeLabel[node.type]}, id: ${node.id}`,
            clickCallback,
            closeCallback,
            color: node.id === 0
                ? MasterGainColor
                : NodeTypeColors[node.type],
            content: node.type === NodeTypes.CUSTOM
                ? titleEditor()
                : undefined
        });
        this.getOpenWindow[node.id] = dialogBox;
        dialogBox.children[1].appendChild(this.createValuesWindow(node, () => this.save(), deleteCallBack));
        D('node-windows').appendChild(dialogBox);
        moveTheWindowToTheTop(dialogBox);
        if (node.id in this.lastCoordsOfWindow) {
            const [x, y] = this.lastCoordsOfWindow[node.id];
            dialogBox.style.left = x + 'px';
            dialogBox.style.top = y + 'px';
        }
        else {
            const container = D('nunigraph-stuff');
            const canvas = this.renderer.canvas;
            const placeUnder = node.y < .25 ? -1 : 1;
            UI_clamp(node.x * canvas.offsetWidth, node.y * canvas.offsetHeight - dialogBox.offsetHeight * placeUnder, dialogBox, container);
        }
    }
    getNodesInBox(x, y) {
        const { width: W, height: H } = this.renderer.canvas;
        if (!this.mouseIsDown) {
            return this.selectedNodes;
        }
        if (this.selectionStart) {
            const [X, Y] = this.selectionStart;
            return this.selectedNodes =
                this.g.nodes.filter(node => {
                    const [startX, endX] = [x, X].sort((a, b) => a - b);
                    const [startY, endY] = [y, Y].sort((a, b) => a - b);
                    const isInside = (nodeX, nodeY) => startX < nodeX && nodeX < endX &&
                        startY < nodeY && nodeY < endY;
                    return isInside(node.x * W, node.y * H);
                });
        }
        return this.selectedNodes;
    }
    toggleDialogBox(node) {
        if (!this.getOpenWindow[node.id]) {
            this.openWindow(node);
            this.getOpenWindow[node.id].classList.add('selected2');
        }
        else {
            this.closeWindow(node.id);
        }
    }
    mousedown(e) {
        this.mouseHasMovedSinceLastMouseDown = false;
        this.hideContextMenu();
        this.mouseIsDown = true;
        const hoverMsg = this.lastMouse_DownMsg =
            this.renderer.getGraphMouseTarget(e);
        const { id, node } = hoverMsg;
        this.lastMouse_DownXY = [e.offsetX, e.offsetY];
        if ((hoverMsg.type === HOVER.EDGE || hoverMsg.type === HOVER.SELECT)
            && this.selectedNodes.includes(hoverMsg.node)) {
            const nodes = this.selectedNodes;
            const o = { top: nodes.reduce((a, node) => Math.max(a, node.y), 0),
                bottom: nodes.reduce((a, node) => Math.min(a, node.y), 1),
                left: nodes.reduce((a, node) => Math.min(a, node.x), 1),
                right: nodes.reduce((a, node) => Math.max(a, node.x), 0)
            };
            this.lastMouse_DownMsg.bounds =
                { U: o.top - node.y,
                    D: node.y - o.bottom,
                    L: node.x - o.left,
                    R: o.right - node.x
                };
        }
        ;
        ({
            [HOVER.SELECT]: () => {
                this.save();
                if (this.selectedNodes.includes(node))
                    return;
                this.selectNode(node);
                this.renderer.render({ selectedNodes: [node] });
            },
            [HOVER.EDGE]: () => {
                this.selectedNodes = [];
                this.unselectNodes();
                if (HasNoOutput[node.type])
                    return;
                this.renderer.fromNode = node;
            },
            [HOVER.CONNECTION]: () => {
                this.selectedNodes = [];
                const cache = this.renderer.connectionsCache;
                const { fromId, toId, connectionType } = cache[id];
                this.save();
                this.unselectNodes();
                this.renderer.fromNode =
                    this.g.nodes.find(node => node.id === fromId);
                const to = this.g.nodes.find(node => node.id === toId);
                delete cache[id];
                if (to.audioNode instanceof NuniGraphAudioNode) {
                    const inputNode = to.audioNode.controller.g.nodes.find(node => { var _a; return ((_a = node.INPUT_NODE_ID) === null || _a === void 0 ? void 0 : _a.id) === fromId; });
                    if (!inputNode)
                        throw 'error, this should be here';
                    to.audioNode.controller.closeWindow(inputNode.id);
                }
                this.g.disconnect(this.renderer.fromNode, to, connectionType);
            },
            [HOVER.EMPTY]: () => {
                this.selectedNodes = [];
                this.unselectNodes();
                const { x, y } = this.getMousePos(e);
                this.selectionStart = [x, y];
                this.renderer.render();
            }
        })[hoverMsg.type]();
        const deselectNodesOfOtherGraphs = () => {
            for (const controller of ActiveControllers) {
                if (controller !== this) {
                    controller.unselectNodes();
                    controller.renderer.render();
                }
            }
        };
        deselectNodesOfOtherGraphs();
    }
    mousemove(e) {
        const [x, y] = this.lastMouse_DownXY;
        if (Math.abs(x - e.offsetX) > 1 || Math.abs(y - e.offsetY) > 1) {
            this.mouseHasMovedSinceLastMouseDown = true;
        }
        const isPressing = e.buttons === 1 && this.mouseIsDown;
        const msg = this.renderer.getGraphMouseTarget(e);
        const { width: W, height: H } = this.renderer.canvas;
        const { selectedNodes } = this;
        if (!this.selectionStart
            && selectedNodes.length
            && isPressing) {
            const { node, bounds } = this.lastMouse_DownMsg;
            const { U, D, L, R } = bounds || { U: 0, D: 0, L: 0, R: 0 };
            const _x = node.x;
            const _y = node.y;
            const _dx = e.offsetX / W - _x;
            const _dy = e.offsetY / H - _y;
            node.x = clamp(L, _x + _dx, 1 - R);
            node.y = clamp(D, _y + _dy, 1 - U);
            const dx = node.x - _x;
            const dy = node.y - _y;
            for (const n of selectedNodes) {
                if (n === node)
                    continue;
                n.x += dx;
                n.y += dy;
            }
        }
        const { type: lastType } = this.lastMouse_MoveMsg;
        const { type } = msg;
        if (type !== HOVER.SELECT
            && type !== HOVER.EDGE
            && lastType === type
            && !this.renderer.fromNode
            && !isPressing
            && !this.selectionStart) {
            return;
        }
        this.lastMouse_MoveMsg = msg;
        const hover_id = msg.type === HOVER.CONNECTION
            ? msg.id
            : msg.type !== HOVER.EMPTY
                ? msg.node.id : undefined;
        const options = { x: e.offsetX,
            y: e.offsetY,
            buttons: e.buttons,
            hover_type: type,
            hover_id,
            selectionStart: this.selectionStart,
            selectedNodes: this.getNodesInBox(e.offsetX, e.offsetY)
        };
        this.renderer.render(options);
    }
    mouseup(e) {
        if (e.ctrlKey && e.target === this.renderer.canvas) {
            const X = e.offsetX / this.renderer.canvas.width;
            const Y = e.offsetY / this.renderer.canvas.height;
            this.selectedNodes =
                this.g.pasteNodes(X, Y, clipboard.nodes, clipboard.connections);
            this.renderer.render(this);
        }
        this.mouseIsDown = false;
        this.selectionStart = undefined;
        const { renderer, selectedNodes } = this;
        const fromNode = renderer.fromNode;
        const msg = renderer.getGraphMouseTarget(e);
        if (!fromNode) {
            if (!this.mouseHasMovedSinceLastMouseDown
                && (msg.type === HOVER.SELECT || msg.type === HOVER.EDGE)
                && msg.node === this.lastMouse_DownMsg.node) {
                this.toggleDialogBox(msg.node);
            }
            renderer.render({ selectedNodes });
            return;
        }
        if (msg.node === fromNode) {
            renderer.fromNode = null;
            renderer.render();
            return;
        }
        const do_it = () => this.promptUserToSelectConnectionType(fromNode, msg.node, e.clientX, e.clientY);
        const render = () => renderer.render({ selectedNodes });
        renderer.fromNode = null;
        ({ [HOVER.EDGE]: do_it,
            [HOVER.SELECT]: do_it,
            [HOVER.CONNECTION]: render,
            [HOVER.EMPTY]: render
        })[msg.type]();
    }
    keydown(e) {
        if (e.keyCode === 46 || (ISMAC && e.keyCode === 8)) {
            if (this.selectedNodes.length) {
                this.save();
                for (const node of this.selectedNodes) {
                    if (node.id !== 0) {
                        this.deleteNode(node);
                    }
                }
            }
        }
        else if (e.ctrlKey && e.keyCode === 83) {
            const nodesToCopy = this.selectedNodes.filter(node => !node.INPUT_NODE_ID);
            if (nodesToCopy.length === 0)
                return;
            this.save();
            this.selectedNodes =
                this.g.reproduceNodesAndConnections(nodesToCopy);
            this.renderer.render(this);
            if (this.selectedNodes.length === 1) {
                this.openWindow(this.selectedNodes[0]);
            }
        }
        else if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 88)) {
            const nodesToCopy = this.selectedNodes.filter(node => !node.INPUT_NODE_ID);
            if (nodesToCopy.length === 0)
                return;
            clipboard.nodes = nodesToCopy.map(this.g.convertNodeToNodeSettings);
            clipboard.connections = nodesToCopy.map(node => {
                const connectionList = [];
                for (const { id, connectionType } of this.g.oneWayConnections[node.id] || []) {
                    const index = nodesToCopy.findIndex(node => node.id === id);
                    if (index >= 0) {
                        connectionList.push({ id: index, connectionType });
                    }
                }
                return connectionList;
            });
            if (e.keyCode === 67) {
                requestAnimationFrame(() => {
                    this.renderer.render();
                    requestAnimationFrame(() => {
                        this.renderer.render({ selectedNodes: nodesToCopy });
                    });
                });
            }
            else if (e.keyCode === 88) {
                for (const node of nodesToCopy) {
                    if (node.id !== 0) {
                        this.deleteNode(node, { noRender: true });
                    }
                }
                this.renderer.render();
            }
        }
    }
    promptUserToSelectConnectionType(node1, node2, x, y) {
        const { renderer } = this;
        const makeConnection = (destination) => {
            this.save();
            this.g.makeConnection(node1, node2, destination);
            renderer.render();
            if (OpensDialogBoxWhenConnectedTo[node2.type]) {
                this.openWindow(node2);
            }
        };
        const types = (SupportsInputChannels[node2.type]
            ? ['channel']
            : []).concat(AudioNodeParams[node2.type]);
        if (node2.id === 0 || types.length === 1) {
            makeConnection(types[0]);
            return;
        }
        this.deactivateEventHandlers();
        const prompt = D('connection-type-prompt');
        const hide_it = () => {
            prompt.classList.remove('show-grid');
            this.activateEventHandlers();
        };
        prompt.classList.add('show-grid');
        prompt.innerHTML = '';
        prompt.style.zIndex = Number.MAX_SAFE_INTEGER.toString();
        for (const param of types) {
            const btn = E('button', { text: param, className: 'connection-type-button' });
            btn.style.borderColor = ConnectionTypeColors[param];
            btn.onclick = () => {
                hide_it();
                makeConnection(param);
            };
            prompt.appendChild(btn);
        }
        const cancel = E('button', { text: 'cancel',
            className: 'connection-type-button'
        });
        cancel.onclick = hide_it;
        prompt.appendChild(cancel);
        const w = prompt.offsetWidth;
        const _x = renderer.canvas.width / 2 + renderer.canvas.offsetLeft;
        UI_clamp(x > _x ? x - w : x + w, y + 40, prompt, document.body);
    }
}
//# sourceMappingURL=graph_controller.js.map
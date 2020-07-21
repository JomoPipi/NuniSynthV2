export var HOVER;
(function (HOVER) {
    HOVER[HOVER["EDGE"] = 0] = "EDGE";
    HOVER[HOVER["SELECT"] = 1] = "SELECT";
    HOVER[HOVER["CONNECTION"] = 2] = "CONNECTION";
    HOVER[HOVER["EMPTY"] = 3] = "EMPTY";
})(HOVER || (HOVER = {}));
const snapToGridBtn = D('snap-to-grid-btn');
let snapToGrid = false;
snapToGridBtn.onclick = () => {
    snapToGrid = snapToGridBtn.classList.toggle('selected');
};
export class NuniGraphRenderer {
    constructor(g, canvas) {
        this.fromNode = null;
        this.g = g;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodeRadius = 25;
        this.nodeLineWidth = this.nodeRadius / 5 + 3;
        this.connectionLineWidth = PHI;
        this.innerEdgeBoundary = this.nodeRadius / 1.5;
        this.outerEdgeBoundary = this.nodeRadius + this.nodeLineWidth;
        this.triangleRadius = this.nodeRadius / 3.0;
        this.triangleSize = this.innerEdgeBoundary;
        this.connectionsCache = {};
    }
    removeFromConnectionsCache(id) {
        for (const connectionId in this.connectionsCache) {
            const { fromId, toId } = this.connectionsCache[connectionId];
            if (fromId === id || toId === id) {
                delete this.connectionsCache[connectionId];
            }
        }
    }
    setNodeRadius(r) {
        this.nodeRadius = r;
        this.nodeLineWidth = this.nodeRadius / 5 + 3;
        this.connectionLineWidth = PHI;
        this.innerEdgeBoundary = this.nodeRadius / 1.5;
        this.outerEdgeBoundary = this.nodeRadius + this.nodeLineWidth;
        this.triangleRadius = this.nodeRadius / 3.0;
        this.triangleSize = this.innerEdgeBoundary;
    }
    dashedBox(x, y, X, Y) {
        const { ctx } = this;
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.strokeRect(X, Y, x - X, y - Y);
        ctx.setLineDash([]);
        return;
    }
    circle(x, y, r) {
        const { ctx } = this;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 7);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    line(x1, y1, x2, y2) {
        const { ctx } = this;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
    directedLine(x1, y1, x2, y2, cacheOptions) {
        const { ctx, nodeRadius, nodeLineWidth, connectionsCache, triangleRadius } = this;
        ctx.fillStyle = 'cyan';
        const delta = nodeRadius + nodeLineWidth;
        const m = (y1 - y2) / (x1 - x2);
        const angle = Math.atan(m);
        const dy = Math.sin(angle) * delta;
        const dx = Math.cos(angle) * delta;
        const z = x1 >= x2 ? -1 : 1;
        const W = cacheOptions ? 1 : 0;
        const [x, y, X, Y] = [x1 + dx * z, y1 + dy * z, x2 - dx * z * W, y2 - dy * z * W];
        if (cacheOptions) {
            const { fromId, toId, connectionType, x, y } = cacheOptions;
            const c_id = `${fromId}:${toId}:${connectionType}`;
            const data = connectionsCache[c_id] =
                connectionsCache[c_id] || { fromId, toId, connectionType };
            data.x = X - dx * z * W / 3.0;
            data.y = Y - dy * z * W / 3.0;
            if (x && y &&
                distance(x, y, data.x, data.y) < triangleRadius) {
                ctx.fillStyle = 'orange';
            }
        }
        this.line(x, y, X, Y);
        this.drawDirectionTriangle(X, Y, angle, x >= X);
    }
    drawGridLines(H, W, snapNodes, selectedNodes) {
        const { ctx, g } = this;
        ctx.lineWidth = 0.4;
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        const gridGrap = 30;
        for (let i = 0; i < Math.max(W, H); i += gridGrap) {
            this.line(0, i, W, i);
            this.line(i, 0, i, H);
        }
        if (snapNodes) {
            for (const node of selectedNodes) {
                const { x, y } = node;
                const [X, Y] = [x * W, y * H];
                const [newX, newY] = [
                    Math.round(X / gridGrap) * gridGrap / W,
                    Math.round(Y / gridGrap) * gridGrap / H
                ];
                if (!g.nodes.some(node => node.x === newX && node.y === newY)) {
                    node.x = newX;
                    node.y = newY;
                }
            }
        }
    }
    drawDirectionTriangle(x, y, angle, flipH) {
        const { ctx, triangleSize } = this;
        const h = (flipH ? 1 : -1) * triangleSize;
        const dt = 0.5;
        const dt1 = angle + dt;
        const dt2 = angle - dt;
        ctx.translate(x, y);
        ctx.rotate(dt1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(h, 0);
        ctx.rotate(-dt1);
        ctx.rotate(dt2);
        ctx.lineTo(h, 0);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.closePath();
        ctx.rotate(-dt2);
        ctx.translate(-x, -y);
    }
    getParallelConnectionGroups(fromId) {
        return this.g.oneWayConnections[fromId].reduce((groups, v) => (Object.assign(Object.assign({}, groups), { [v.id]: [...(groups[v.id] || []), v] })), {});
    }
    drawNodeConnections(nodes, { H, W, x, y }) {
        const { ctx, connectionLineWidth, nodeRadius, g } = this;
        ctx.lineWidth = connectionLineWidth;
        for (const id1 in g.oneWayConnections) {
            const fromId = +id1;
            const idGroups = this.getParallelConnectionGroups(fromId);
            for (const i in idGroups) {
                const groups = idGroups[i];
                const connections = groups.length;
                groups.forEach(({ id: toId, connectionType }, i) => {
                    const a = nodes.find(node => node.id === fromId);
                    const b = nodes.find(node => node.id === toId);
                    const [xa, ya] = [a.x * W, a.y * H];
                    const [xb, yb] = [b.x * W, b.y * H];
                    const mP = -(xa - xb) / (ya - yb);
                    const shift = nodeRadius / 2.0;
                    const theta = Math.atan(mP);
                    const dy2 = Math.sin(theta) * shift;
                    const dx2 = Math.cos(theta) * shift;
                    const I = i - (connections - 1) / 2.0;
                    const [x1, x2] = [xa + dx2 * I, xb + dx2 * I];
                    const [y1, y2] = [ya + dy2 * I, yb + dy2 * I];
                    ctx.strokeStyle = ConnectionTypeColors[connectionType];
                    this.directedLine(x1, y1, x2, y2, { fromId, toId, connectionType, x, y });
                });
            }
        }
    }
    getNodeColor(node, H, W, highlight) {
        const { nodeRadius, ctx } = this;
        if (HasNoAudioParams[node.type]) {
            const c2 = highlight ? 'pink' : 'black';
            const { x, y } = node, r = nodeRadius;
            const gradient = ctx.createRadialGradient(x * W, y * H, r / 27.0, x * W, y * H, r);
            gradient.addColorStop(0, 'gray');
            gradient.addColorStop(0.9, c2);
            return gradient;
        }
        const prop = AudioNodeParams[node.type][0];
        const pValue = node.audioParamValues[prop];
        const [min, max] = AudioParamRanges[prop];
        const factor = Math.log2(pValue - min) / (Math.log2(max - min) || 0.5);
        const cval = factor * 4;
        const c1 = `rgb(${[0, 1, 2].map(n => 100 * (1 + Math.sin(cval + n * twoThirdsPi)) | 0).join(',')})`;
        const c2 = highlight ? 'pink' : 'black';
        const { x, y } = node, r = nodeRadius;
        const gradient = ctx.createRadialGradient(x * W, y * H, r / 27.0, x * W, y * H, r);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(0.9, c2);
        return gradient;
    }
    drawNodes(nodes, options) {
        const { canvas, ctx, nodeRadius, fromNode, nodeLineWidth } = this;
        const { H, W, buttons, hover_type, hover_id, selectedNodes } = options;
        const isSelect = hover_type === HOVER.SELECT;
        const isEdge = hover_type === HOVER.EDGE;
        canvas.style.cursor =
            isSelect || (fromNode && isEdge)
                ? buttons === 1 ? 'grabbing' : 'grab'
                : isEdge ? 'crosshair'
                    : ' ';
        for (const node of nodes) {
            const [X, Y] = [node.x * W, node.y * H];
            const isTarget = node.id === hover_id;
            const highlightEdge = !fromNode &&
                isTarget &&
                hover_type === HOVER.EDGE;
            const highlightCenter = selectedNodes.includes(node) ||
                (isTarget && (fromNode || hover_type === HOVER.SELECT))
                ? true : false;
            ctx.strokeStyle =
                highlightEdge
                    ? 'rgba(255,255,255,0.75)'
                    : node.id === 0 ? MasterGainColor : NodeTypeColors[node.type];
            ctx.lineWidth = nodeLineWidth;
            ctx.shadowColor = '';
            ctx.fillStyle =
                this.getNodeColor(node, H, W, highlightCenter);
            this.circle(X, Y, nodeRadius);
            if (node.title) {
                ctx.fillStyle = '#BAA';
                ctx.fillText(node.title, X - 30, Y - nodeRadius * 1.5);
            }
        }
    }
    render(options = {}) {
        const { g, canvas, ctx, fromNode, connectionLineWidth } = this;
        const nodes = g.nodes;
        const W = canvas.width = canvas.offsetWidth;
        const H = canvas.height = canvas.offsetHeight;
        const { x, y, buttons, selectionStart, selectedNodes, } = options;
        const innerOptions = Object.assign(Object.assign({}, options), { H, W, selectedNodes: selectedNodes || [] });
        ctx.font = '15px Arial';
        ctx.clearRect(0, 0, W, H);
        if (snapToGrid) {
            const snapNodes = buttons === 0;
            this.drawGridLines(H, W, snapNodes, selectedNodes);
        }
        if (selectionStart) {
            const [X, Y] = selectionStart;
            this.dashedBox(x, y, X, Y);
        }
        this.drawNodeConnections(nodes, innerOptions);
        this.drawNodes(nodes, innerOptions);
        if (fromNode) {
            const [X, Y] = [fromNode.x * W, fromNode.y * H];
            ctx.lineWidth = connectionLineWidth;
            ctx.strokeStyle = 'white';
            this.directedLine(X, Y, x, y);
        }
    }
    getGraphMouseTarget({ offsetX: x, offsetY: y }) {
        const { canvas, g, innerEdgeBoundary, outerEdgeBoundary, connectionsCache, triangleRadius } = this;
        const { width: W, height: H } = canvas;
        const nodes = g.nodes;
        for (const checkNodeClicked of [true, false]) {
            for (const node of nodes) {
                const [X, Y] = [node.x * W, node.y * H];
                const d = distance(x, y, X, Y);
                const aroundEdge = innerEdgeBoundary < d && d < outerEdgeBoundary;
                if (checkNodeClicked) {
                    if (d < innerEdgeBoundary) {
                        return { type: HOVER.SELECT, node };
                    }
                }
                else {
                    if (aroundEdge) {
                        return { type: HOVER.EDGE, node };
                    }
                }
            }
        }
        for (const id in connectionsCache) {
            const { x: X, y: Y } = connectionsCache[id];
            if (distance(x, y, X, Y) < triangleRadius) {
                return { type: HOVER.CONNECTION, id: +id };
            }
        }
        return { type: HOVER.EMPTY };
    }
}
//# sourceMappingURL=graph_renderer.js.map
import { NuniGraphNode } from './nunigraph_node.js';
import { LZW_compress, LZW_decompress } from '../../helpers/lzw_compression.js';
import { SubgraphSequencer, NuniAudioParam, Sequencer, NuniGraphAudioNode } from '../../webaudio2/internal.js';
const defaultNodeSettings = () => ({
    x: 0.5,
    y: 0.5,
    audioParamValues: {},
    audioNodeProperties: {}
});
export class NuniGraph {
    constructor() {
        this.nextId = 0;
        this.nodes = [];
        this.oneWayConnections = {};
        this.initializeMasterGain();
    }
    initializeMasterGain() {
        const masterGainSettings = Object.assign(defaultNodeSettings(), {
            audioParamValues: { [NodeTypes.GAIN]: 1 },
            x: 0.5,
            y: 0.125,
            title: 'OUTPUT'
        });
        this.createNewNode(NodeTypes.GAIN, masterGainSettings);
    }
    createNewNode(type, settings) {
        if (!settings) {
            settings = defaultNodeSettings();
        }
        const node = new NuniGraphNode(this.nextId++, type, settings);
        this.nodes.push(node);
        return node;
    }
    pasteNodes(X, Y, _nodes, connections) {
        const centerX = _nodes.reduce((a, { x }) => a + x, 0) / _nodes.length;
        const centerY = _nodes.reduce((a, { y }) => a + y, 0) / _nodes.length;
        const nodes = _nodes.map(({ type, x, y, audioParamValues, audioNodeProperties, INPUT_NODE_ID, title }) => {
            const newX = clamp(0, x - centerX + X, 1);
            const newY = clamp(0, y - centerY + Y, 1);
            const settings = {
                x: newX,
                y: newY,
                audioParamValues,
                audioNodeProperties,
                title: INPUT_NODE_ID ? undefined : title
            };
            return this.createNewNode(type, settings);
        });
        const retainedInputs = new Set();
        for (const indexA in nodes) {
            const a = nodes[indexA];
            for (const { id: indexB, connectionType } of connections[indexA]) {
                const b = nodes[indexB];
                if (b.audioNode instanceof NuniGraphAudioNode) {
                    const innerInputNode = b.audioNode.controller.g.nodes.find(node => { var _a; return ((_a = node.INPUT_NODE_ID) === null || _a === void 0 ? void 0 : _a.id) === _nodes[indexA].oldId; });
                    if (!innerInputNode)
                        throw 'An input node with INPUT_NODE_ID = nodeA.id should exist inside node b';
                    innerInputNode.INPUT_NODE_ID.id = a.id;
                    innerInputNode.title = `INPUT (id-${a.id})`;
                    retainedInputs.add(a.id);
                    b.audioNode.inputs[a.id] = innerInputNode;
                    delete b.audioNode.inputs[_nodes[indexA].oldId];
                }
                this.makeConnection(a, b, connectionType);
            }
        }
        for (const node of nodes) {
            if (node.audioNode instanceof NuniGraphAudioNode) {
                for (const moduleNode of [...node.audioNode.controller.g.nodes]) {
                    if (moduleNode.INPUT_NODE_ID) {
                        const input_id = moduleNode.INPUT_NODE_ID.id;
                        if (!retainedInputs.has(input_id)) {
                            node.audioNode.controller.deleteNode(moduleNode, true);
                        }
                    }
                }
            }
        }
        for (const i in _nodes) {
            const an = nodes[i].audioNode;
            if (an instanceof SubgraphSequencer) {
                const matrix = _nodes[i].audioNode.stepMatrix;
                const matrixWithRemappedKeys = Object.keys(matrix).reduce((mat, key) => {
                    const index = _nodes.findIndex(({ oldId }) => oldId === +key);
                    if (index >= 0) {
                        mat[nodes[index].id] = matrix[key];
                    }
                    return mat;
                }, {});
                an.stepMatrix = JSON.parse(JSON.stringify(matrixWithRemappedKeys));
            }
        }
        return nodes;
    }
    reproduceNode(node) {
        const copiedNode = this.convertNodeToNodeSettings(node);
        const { type, x, y, audioParamValues, audioNodeProperties, title, INPUT_NODE_ID } = copiedNode;
        const newX = clamp(0, x + 0.07, 1);
        const newY = newX === 1 ? clamp(0, y - 0.07, 1) : y;
        const settings = {
            x: newX,
            y: newY,
            audioParamValues,
            audioNodeProperties,
            INPUT_NODE_ID
        };
        if (!INPUT_NODE_ID)
            settings.title = title;
        if (node.type === NodeTypes.B_SEQ) {
            log('stepMatrix =', settings.audioNodeProperties.stepMatrix);
        }
        return this.createNewNode(type, settings);
    }
    reproduceNodesAndConnections(nodes) {
        const correspondenceMap = nodes.reduce((map, node) => {
            map[node.id] = this.reproduceNode(node);
            return map;
        }, {});
        this.reproduceConnections(correspondenceMap);
        this.copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(nodes, correspondenceMap);
        return Object.values(correspondenceMap);
    }
    reproduceConnections(mapToNewNode) {
        for (const id1 in this.oneWayConnections) {
            for (const { id: id2, connectionType } of this.oneWayConnections[id1]) {
                const nodeA = this.nodes.find(node => node.id === +id1);
                const nodeB = this.nodes.find(node => node.id === id2);
                if (!nodeA || !nodeB)
                    throw 'Something is wrong here';
                const a = mapToNewNode[nodeA.id] || nodeA;
                const b = mapToNewNode[nodeB.id] || nodeB;
                if (a !== nodeA || b !== nodeB) {
                    this.copyModuleInputNodes(a, b, nodeA, nodeB);
                    this.makeConnection(a, b, connectionType);
                }
            }
        }
    }
    copyModuleInputNodes(a, b, nodeA, nodeB) {
        if (b.audioNode instanceof NuniGraphAudioNode && b !== nodeB) {
            const innerInputNode = b.audioNode.controller.g.nodes.find(node => { var _a; return ((_a = node.INPUT_NODE_ID) === null || _a === void 0 ? void 0 : _a.id) === nodeA.id; });
            if (!innerInputNode)
                throw 'An input node with INPUT_NODE_ID = nodeA.id should exist inside node b';
            innerInputNode.INPUT_NODE_ID.id = a.id;
            innerInputNode.title = `INPUT (id-${a.id})`;
            b.audioNode.inputs[a.id] = innerInputNode;
            if (a !== nodeA) {
                delete b.audioNode.inputs[nodeA.id];
            }
        }
    }
    copyThingsThatCanOnlyBeCopiedAfterConnectionsAreMade(nodes, mapToNewNode) {
        var _a, _b;
        for (const node of nodes) {
            if (node.audioNode instanceof Sequencer) {
                if (node.type === NodeTypes.B_SEQ)
                    continue;
                const matrix = node.audioNode.stepMatrix;
                for (const id in matrix) {
                    const newId = (_b = (_a = mapToNewNode[id]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : id;
                    mapToNewNode[node.id]
                        .audioNode
                        .stepMatrix[newId]
                        = matrix[id].slice();
                }
            }
        }
    }
    deleteNode(node) {
        if (node.audioNode instanceof Sequencer) {
            node.audioNode.stop();
        }
        node.audioNode.disconnect();
        this.disconnectFromSpecialNodes(node);
        const idx = this.nodes.findIndex(_node => _node === node);
        this.nodes.splice(idx, 1);
        delete this.oneWayConnections[node.id];
        for (const id in this.oneWayConnections) {
            this.oneWayConnections[id] =
                this.oneWayConnections[id].filter(({ id }) => id !== node.id);
        }
    }
    disconnectFromSpecialNodes(node) {
        for (const { audioNode } of this.nodes) {
            if (audioNode instanceof SubgraphSequencer && audioNode.channelData[node.id]) {
                audioNode.removeInput(node);
            }
            else if (audioNode instanceof NuniGraphAudioNode && audioNode.inputs[node.id]) {
                audioNode.removeInput(node);
            }
        }
    }
    makeConnection(node1, node2, connectionType) {
        const connections = this.oneWayConnections[node1.id];
        const isDuplicate = connections === null || connections === void 0 ? void 0 : connections.find(data => data.id === node2.id &&
            data.connectionType === connectionType);
        if (isDuplicate)
            return;
        const destinationData = {
            id: node2.id,
            connectionType
        };
        if (!connections || connections.length === 0)
            this.oneWayConnections[node1.id] = [destinationData];
        else
            connections.push(destinationData);
        const destination = this.prepareDestination(connectionType)(node2.audioNode);
        this.connect_audioNode_to_destination(node1, destination);
    }
    connect_audioNode_to_destination(node1, destination) {
        if (destination instanceof NuniGraphAudioNode || destination instanceof SubgraphSequencer) {
            destination.addInput(node1);
        }
        else if (destination instanceof NuniAudioParam) {
            node1.audioNode.connect(destination.offset);
        }
        else {
            node1.audioNode.connect(destination);
        }
    }
    disconnect(node1, node2, connectionType) {
        const connections = this.oneWayConnections[node1.id];
        if (!connections)
            throw 'check what happened here';
        const connectionIndex = connections.findIndex(data => data.id === node2.id &&
            data.connectionType === connectionType);
        connections.splice(connectionIndex, 1);
        const destination = this.prepareDestination(connectionType)(node2.audioNode);
        this.disconnect_audioNode_from_destination(node1, destination);
    }
    disconnect_audioNode_from_destination(node1, destination) {
        if (destination instanceof SubgraphSequencer || destination instanceof NuniGraphAudioNode) {
            destination.removeInput(node1);
        }
        else if (destination instanceof NuniAudioParam) {
            node1.audioNode.disconnect(destination.offset);
        }
        else {
            node1.audioNode.disconnect(destination);
        }
    }
    prepareDestination(connectionType) {
        return (destination) => connectionType === 'channel' ? destination : destination[connectionType];
    }
    clear() {
        for (const node of [...this.nodes]) {
            if (node.id === 0)
                continue;
            this.deleteNode(node);
        }
    }
    toRawString() {
        return JSON.stringify({
            connections: this.oneWayConnections,
            nodes: this.nodes.map(this.convertNodeToNodeSettings)
        });
    }
    convertNodeToNodeSettings(node) {
        const nodeCopy = Object.assign(Object.assign({}, node), { audioNode: Object.assign({}, node.audioNode) });
        for (const name in nodeCopy.audioNode) {
            if (nodeCopy.type !== NodeTypes.SGS || !SGS_MustBeKeptOnAudioNodeForCopyingAfterConnectionsAreMade[name]) {
                delete nodeCopy.audioNode[name];
            }
        }
        const settings = Object.assign(Object.assign({}, JSON.parse(JSON.stringify(nodeCopy))), { audioNodeProperties: {}, oldId: node.id });
        for (const prop in Transferable_AudioNode_Properties) {
            if (node.type === NodeTypes.SGS && (prop === 'stepMatrix' || prop === 'channelData')) {
                continue;
            }
            if (prop in node.audioNode) {
                const p = prop;
                settings.audioNodeProperties[prop] =
                    JSON.parse(JSON.stringify(node.audioNode[p]));
            }
        }
        return settings;
    }
    fromRawString(s) {
        try {
            var { connections, nodes } = JSON.parse(s);
        }
        catch (e) {
            throw `Error parsing new graph: ${e}`;
        }
        this.clear();
        if (nodes[0].id !== 0)
            throw 'Oh, I did not expect this.';
        this.nodes[0].x = nodes[0].x;
        this.nodes[0].y = nodes[0].y;
        this.nodes[0].setValueOfParam('gain', nodes[0].audioParamValues.gain);
        this.nodes[0].title = 'OUTPUT';
        for (const node of nodes) {
            const { id, type, x, y, audioParamValues, audioNodeProperties, title, INPUT_NODE_ID } = node;
            if (id === 0)
                continue;
            const settings = {
                x,
                y,
                audioParamValues,
                audioNodeProperties,
                INPUT_NODE_ID,
            };
            if (!INPUT_NODE_ID)
                settings.title = title;
            const newNode = new NuniGraphNode(id, type, settings);
            this.nodes.push(newNode);
        }
        this.nextId =
            Math.max(...this.nodes.map(node => node.id)) + 1;
        for (const id in connections) {
            for (const { id: id2, connectionType } of connections[id]) {
                const nodeA = this.nodes.find(node => node.id === +id);
                const nodeB = this.nodes.find(node => node.id === id2);
                if (nodeB.audioNode instanceof NuniGraphAudioNode) {
                    const innerInputNode = nodeB.audioNode.controller.g.nodes.find(node => node.INPUT_NODE_ID && node.INPUT_NODE_ID.id === nodeA.id);
                    if (!(innerInputNode === null || innerInputNode === void 0 ? void 0 : innerInputNode.INPUT_NODE_ID))
                        throw 'It should be there';
                    innerInputNode.title = `INPUT (id-${nodeA.id})`;
                    nodeB.audioNode.inputs[nodeA.id] = innerInputNode;
                }
                this.makeConnection(nodeA, nodeB, connectionType);
            }
        }
        for (const node of nodes) {
            if (node.type === NodeTypes.SGS) {
                const thisNode = this.nodes.find(n => n.id === node.id);
                thisNode.audioNode.stepMatrix = node.audioNode.stepMatrix;
            }
        }
    }
    toString() {
        return LZW_compress(this.toRawString());
    }
    fromString(s) {
        return this.fromRawString(LZW_decompress(s));
    }
}
//# sourceMappingURL=nunigraph.js.map
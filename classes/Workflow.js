// Workflow State & Logic
class Workflow {
  constructor(definitions) {
    this.definitions = definitions;
    this.nodes = {};
    this.edges = [];
    this.selectedNode = null;
    this.nodeCounter = 0;
    this.edgeCounter = 0;
    this.variables = {};
  }

  addNode(type, x, y) {
    const id = 'n' + (++this.nodeCounter);
    const d = this.definitions[type];
    const node = new WorkflowNode(id, type, x, y);
    node.initConfig(d.fields || []);
    this.nodes[id] = node;
    return id;
  }

  deleteNode(id) {
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    delete this.nodes[id];
    if (this.selectedNode === id) {
      this.selectedNode = null;
    }
  }

  selectNode(id) {
    this.selectedNode = id;
  }

  addEdge(from, to) {
    if (!this.edges.find(e => e.from === from && e.to === to)) {
      const id = 'e' + (++this.edgeCounter);
      this.edges.push(new WorkflowEdge(id, from, to));
      return id;
    }
    return null;
  }

  deleteEdge(edgeId) {
    this.edges = this.edges.filter(e => e.id !== edgeId);
  }

  updateNodeConfig(nodeId, key, value) {
    if (this.nodes[nodeId]) {
      this.nodes[nodeId].cfg[key] = value;
    }
  }

  getTriggers() {
    return Object.values(this.nodes).filter(n => ['manual', 'scheduler', 'webhook'].includes(n.type));
  }

  clear() {
    this.nodes = {};
    this.edges = [];
    this.selectedNode = null;
    this.variables = {};
  }
}

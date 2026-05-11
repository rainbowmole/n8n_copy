// Main Application Class
class AutoflowApp {
  constructor() {
    this.workflow = new Workflow(DEFS);
    this.renderer = new WorkflowRenderer(this.workflow, DEFS);
    this.executor = new WorkflowExecutor(this.workflow, DEFS);
    this.logger = new ExecutionLogger();
    this.logger.setDefinitions(DEFS);
    this.logger.setWorkflow(this.workflow);
    this.executor.setLogger(this.logger);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const cw = this.renderer.cw;
    cw.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onDocumentMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onDocumentMouseUp(e));
    cw.addEventListener('wheel', (e) => this.onCanvasWheel(e), { passive: false });
  }

  onCanvasMouseDown(e) {
    if (!this.renderer.isCanvasBg(e.target)) return;
    this.renderer.isPanning = true;
    this.renderer.panStart = { x: e.clientX - this.renderer.panX, y: e.clientY - this.renderer.panY };
    this.renderer.cw.classList.add('panning');
    e.preventDefault();
  }

  onDocumentMouseMove(e) {
    if (this.renderer.isPanning) {
      this.renderer.panX = e.clientX - this.renderer.panStart.x;
      this.renderer.panY = e.clientY - this.renderer.panStart.y;
      this.renderer.applyTransform();
      return;
    }
    if (this.renderer.dragNodeId) {
      const r = this.renderer.cw.getBoundingClientRect();
      const wx = (e.clientX - r.left - this.renderer.panX) / this.renderer.scale;
      const wy = (e.clientY - r.top - this.renderer.panY) / this.renderer.scale;
      this.workflow.nodes[this.renderer.dragNodeId].x = wx - this.renderer.dragNodeOffset.x;
      this.workflow.nodes[this.renderer.dragNodeId].y = wy - this.renderer.dragNodeOffset.y;
      const el = document.getElementById('wn-' + this.renderer.dragNodeId);
      if (el) {
        el.style.left = this.workflow.nodes[this.renderer.dragNodeId].x + 'px';
        el.style.top = this.workflow.nodes[this.renderer.dragNodeId].y + 'px';
      }
      this.renderer.renderEdges();
    }
  }

  onDocumentMouseUp(e) {
    this.renderer.isPanning = false;
    this.renderer.dragNodeId = null;
    this.renderer.dragNodeOffset = null;
    this.renderer.cw.classList.remove('panning');
  }

  onCanvasWheel(e) {
    e.preventDefault();
    const r = this.renderer.cw.getBoundingClientRect();
    this.renderer.zoomAt(e.deltaY < 0 ? 0.1 : -0.1, e.clientX - r.left, e.clientY - r.top);
  }

  dragStart(e, t) {
    this.renderer.dragType = t;
    e.dataTransfer.setData('text/plain', t);
  }

  dropNode(e) {
    e.preventDefault();
    const r = this.renderer.cw.getBoundingClientRect();
    const id = this.workflow.addNode(this.renderer.dragType, (e.clientX - r.left - this.renderer.panX) / this.renderer.scale - 76, (e.clientY - r.top - this.renderer.panY) / this.renderer.scale - 40);
    this.renderer.renderNode(id);
    this.renderer.showHint();
  }

  deleteNode(id) {
    this.workflow.deleteNode(id);
    document.getElementById('wn-' + id)?.remove();
    if (this.workflow.selectedNode === id) {
      document.getElementById('rph').textContent = 'Node Config';
      document.getElementById('rpb').innerHTML = '<div style="color:var(--color-text-tertiary);font-size:11px;padding-top:16px;text-align:center;">Select a node</div>';
    }
    this.renderer.renderEdges();
    this.renderer.showHint();
  }

  startConn(e, nid, pt) {
    this.renderer.startConn(e, nid, pt);
  }

  updateNodeConfig(id, k, v) {
    this.workflow.updateNodeConfig(id, k, v);
    this.renderer.renderNode(id);
  }

  async runWorkflow() {
    const btn = document.getElementById('rbtn');
    btn.textContent = '... Running';
    btn.disabled = true;
    Object.keys(this.workflow.nodes).forEach(id => this.renderer.renderNode(id));
    await this.executor.sleep(80);
    await this.executor.execute();
    Object.keys(this.workflow.nodes).forEach(id => this.renderer.renderNode(id));
    btn.innerHTML = '&#9654; Run';
    btn.disabled = false;
  }

  clearAll() {
    this.workflow.clear();
    this.renderer.clearUI();
    this.logger.clear();
  }

  loadExample() {
    this.clearAll();
    this.renderer.panX = 0;
    this.renderer.panY = 0;
    this.renderer.scale = 1;
    const ids = {};
    ids.t = this.workflow.addNode('manual', 30, 60);
    ids.h = this.workflow.addNode('http', 220, 60);
    ids.tf = this.workflow.addNode('transform', 410, 60);
    ids.ie = this.workflow.addNode('ifelse', 220, 200);
    ids.lg = this.workflow.addNode('log', 410, 200);
    ids.sv = this.workflow.addNode('setvar', 30, 200);
    this.workflow.nodes[ids.h].cfg = { method: 'GET', url: 'https://jsonplaceholder.typicode.com/todos/1' };
    this.workflow.nodes[ids.tf].cfg = { map: '{ id: input.data.id, doubled: (input.data.value||0)*2 }' };
    this.workflow.nodes[ids.ie].cfg = { cond: 'input.status===200' };
    this.workflow.nodes[ids.lg].cfg = { message: 'HTTP status: {{status}}' };
    this.workflow.nodes[ids.sv].cfg = { vn: 'lastRun', vv: '' + Date.now() };
    Object.keys(this.workflow.nodes).forEach(id => this.renderer.renderNode(id));
    this.workflow.edges = [
      new WorkflowEdge('e1', ids.t, ids.h),
      new WorkflowEdge('e2', ids.h, ids.tf),
      new WorkflowEdge('e3', ids.h, ids.ie),
      new WorkflowEdge('e4', ids.ie, ids.lg),
      new WorkflowEdge('e5', ids.tf, ids.sv),
    ];
    this.executor.workflow.edgeCounter = 5;
    this.renderer.applyTransform();
    setTimeout(() => this.renderer.renderEdges(), 50);
    this.renderer.showHint();
  }
}

// Global App Instance
const app = new AutoflowApp();

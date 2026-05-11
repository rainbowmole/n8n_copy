// Logger
class ExecutionLogger {
  constructor() {
    this.logs = [];
    this.definitions = {};
  }

  setDefinitions(definitions) {
    this.definitions = definitions;
  }

  setWorkflow(workflow) {
    this.workflow = workflow;
  }

  log(nodeId, msg, type) {
    const t = new Date().toTimeString().split(' ')[0];
    const name = this.workflow.nodes[nodeId] ? this.definitions[this.workflow.nodes[nodeId].type].label : nodeId;
    this.logs.push({ time: t, name, msg, type });
    this.render();
  }

  render() {
    const b = document.getElementById('lb');
    b.innerHTML = this.logs.map(l =>
      `<div class="ll"><span class="lt">${l.time}</span><span class="ln">[${l.name}]</span><span class="lm ${l.type}">${l.msg}</span></div>`
    ).join('');
    b.scrollTop = b.scrollHeight;
  }

  clear() {
    this.logs = [];
    this.render();
  }
}

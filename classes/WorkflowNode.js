// Node Instance
class WorkflowNode {
  constructor(id, type, x, y) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.cfg = {};
    this.st = 'idle';
  }

  initConfig(fields) {
    fields.forEach(f => {
      this.cfg[f.k] = f.opts ? f.opts[0] : '';
    });
  }

  getConfigSummary(defs) {
    const c = this.cfg;
    const d = defs[this.type];
    
    const summaries = {
      http: () => (c.method || 'GET') + ' ' + (c.url ? (c.url.length > 22 ? c.url.slice(0, 20) + '…' : c.url) : 'No URL'),
      email: () => c.to ? '-> ' + c.to : 'No recipient',
      script: () => c.code ? c.code.slice(0, 24) + '…' : 'No code',
      log: () => c.message || d.desc,
      scheduler: () => c.interval || d.desc,
      webhook: () => c.path || '/webhook',
      ifelse: () => c.cond ? 'if ' + c.cond.slice(0, 18) : 'No condition',
      delay: () => c.ms ? 'Wait ' + c.ms + 'ms' : 'Wait 1000ms',
      setvar: () => c.vn ? (c.vn + ' = ' + (c.vv || '?')) : 'No variable',
      transform: () => c.map ? c.map.slice(0, 24) + '…' : 'No expression',
      filter: () => c.expr ? c.expr.slice(0, 22) : 'No filter',
    };
    
    return (summaries[this.type] || (() => d.desc))();
  }
}

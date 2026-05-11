// Executor
class WorkflowExecutor {
  constructor(workflow, definitions) {
    this.workflow = workflow;
    this.definitions = definitions;
    this.logger = null;
  }

  setLogger(logger) {
    this.logger = logger;
  }

  async execute() {
    this.workflow.variables = {};
    Object.keys(this.workflow.nodes).forEach(id => {
      this.workflow.nodes[id].st = 'idle';
    });
    const triggers = this.workflow.getTriggers();
    if (!triggers.length) {
      if (this.logger) this.logger.log('sys', 'No trigger node found', 'w');
      return;
    }
    for (const t of triggers) {
      await this.execNode(t.id, {});
    }
  }

  async execNode(id, input) {
    const n = this.workflow.nodes[id];
    if (!n) return null;
    n.st = 'running';
    if (this.logger) this.logger.render();
    await this.sleep(180 + Math.random() * 150);
    let out = input;
    try {
      out = await this.simExec(n, input);
      n.st = 'success';
      if (this.logger) this.logger.log(id, 'Done: ' + JSON.stringify(out).slice(0, 55), 'ok');
    } catch (err) {
      n.st = 'error';
      if (this.logger) this.logger.log(id, 'Error: ' + err.message, 'e');
      return null;
    }
    for (const edge of this.workflow.edges.filter(e => e.from === id)) {
      await this.sleep(80);
      await this.execNode(edge.to, out);
    }
    return out;
  }

  async simExec(n, input) {
    const c = n.cfg;
    switch (n.type) {
      case 'manual':
        return { triggered: true, ts: Date.now() };
      case 'scheduler':
        return { triggered: true, interval: c.interval || '5min', ts: Date.now() };
      case 'webhook':
        return { triggered: true, path: c.path || '/webhook', body: { hello: 'world' } };
      case 'http':
        if (!c.url) throw new Error('No URL');
        if (this.logger) this.logger.log(n.id, (c.method || 'GET') + ' ' + c.url, '');
        return { status: 200, data: { id: ~~(Math.random() * 999) + 1, value: ~~(Math.random() * 100), title: 'sample' } };
      case 'email':
        if (!c.to) throw new Error('No recipient');
        if (this.logger) this.logger.log(n.id, 'Email -> ' + c.to, '');
        return { sent: true, to: c.to, subject: c.subject || '(no subject)' };
      case 'script': {
        const code = c.code || 'return input';
        try {
          const fn = new Function('input', 'variables', code.includes('return') ? code : 'return (' + code + ')');
          const r = fn(input, this.workflow.variables);
          return typeof r === 'object' ? r : { result: r };
        } catch (e) {
          throw new Error('Script: ' + e.message);
        }
      }
      case 'log': {
        const msg = (c.message || '{{input}}').replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, p) => p.split('.').reduce((o, k) => o?.[k], input) ?? '?');
        if (this.logger) this.logger.log(n.id, 'LOG: ' + msg, '');
        return { ...input, logged: msg };
      }
      case 'ifelse': {
        let res = false;
        try {
          res = new Function('input', 'return !!(' + (c.cond || 'true') + ')')(input);
        } catch (e) { }
        if (this.logger) this.logger.log(n.id, 'Condition -> ' + res, res ? 'ok' : 'w');
        return { ...input, condition_result: res, branch: res ? 'true' : 'false' };
      }
      case 'delay': {
        const ms = Math.min(parseInt(c.ms) || 1000, 1200);
        if (this.logger) this.logger.log(n.id, 'Waiting ' + ms + 'ms...', '');
        await this.sleep(ms);
        return { ...input, delayed: true };
      }
      case 'merge':
        return { merged: true, data: input };
      case 'setvar':
        if (!c.vn) throw new Error('No variable name');
        this.workflow.variables[c.vn] = c.vv;
        if (this.logger) this.logger.log(n.id, c.vn + ' = ' + c.vv, '');
        return { ...input, [c.vn]: c.vv };
      case 'transform': {
        try {
          return new Function('input', 'return (' + (c.map || '{}') + ')')(input);
        } catch (e) {
          throw new Error('Transform: ' + e.message);
        }
      }
      case 'filter': {
        const arr = Array.isArray(input.items) ? input.items : [input];
        try {
          const fn = new Function('item', 'return !!(' + (c.expr || 'true') + ')');
          const f = arr.filter(fn);
          if (this.logger) this.logger.log(n.id, 'Filtered: ' + arr.length + '->' + f.length, '');
          return { items: f, count: f.length };
        } catch (e) {
          throw new Error('Filter: ' + e.message);
        }
      }
      default:
        return input;
    }
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

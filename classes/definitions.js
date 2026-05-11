// Node Definitions Registry
const DEFS = {
  manual: new NodeDefinition('manual', 'Manual Trigger', 't', '#1D9E75', '#E1F5EE', '&#9654;', 'Click Run to start', []),
  scheduler: new NodeDefinition('scheduler', 'Scheduler', 't', '#1D9E75', '#E1F5EE', '&#8987;', 'Every interval', [{ k: 'interval', l: 'Interval', t: 'text', ph: '5min / 1h' }]),
  webhook: new NodeDefinition('webhook', 'Webhook', 't', '#1D9E75', '#E1F5EE', '&#9889;', 'Incoming HTTP', [{ k: 'path', l: 'Path', t: 'text', ph: '/my-hook' }]),
  http: new NodeDefinition('http', 'HTTP Request', 'a', '#378ADD', '#E6F1FB', '&#127760;', 'HTTP call', [{ k: 'method', l: 'Method', t: 'sel', opts: ['GET', 'POST', 'PUT', 'DELETE'] }, { k: 'url', l: 'URL', t: 'text', ph: 'https://api.example.com' }]),
  email: new NodeDefinition('email', 'Send Email', 'a', '#378ADD', '#E6F1FB', '&#9993;', 'Send email', [{ k: 'to', l: 'To', t: 'text', ph: 'user@example.com' }, { k: 'subject', l: 'Subject', t: 'text', ph: 'Hello' }, { k: 'body', l: 'Body', t: 'ta', ph: 'Message...' }]),
  script: new NodeDefinition('script', 'Run Script', 'a', '#378ADD', '#E6F1FB', '&#9881;', 'Execute JS', [{ k: 'code', l: 'JS Code', t: 'ta', ph: 'return { result: input.value * 2 }' }]),
  log: new NodeDefinition('log', 'Log Output', 'a', '#378ADD', '#E6F1FB', '&#128221;', 'Print data', [{ k: 'message', l: 'Message', t: 'text', ph: 'Value: {{input.value}}' }]),
  ifelse: new NodeDefinition('ifelse', 'If / Else', 'l', '#BA7517', '#FAEEDA', '&#9830;', 'Branch on condition', [{ k: 'cond', l: 'Condition', t: 'text', ph: 'input.value > 10' }]),
  delay: new NodeDefinition('delay', 'Delay', 'l', '#BA7517', '#FAEEDA', '&#9203;', 'Wait', [{ k: 'ms', l: 'Duration (ms)', t: 'text', ph: '1000' }]),
  merge: new NodeDefinition('merge', 'Merge', 'l', '#BA7517', '#FAEEDA', '&#10233;', 'Merge inputs', []),
  setvar: new NodeDefinition('setvar', 'Set Variable', 'd', '#7F77DD', '#EEEDFE', '$', 'key = value', [{ k: 'vn', l: 'Variable', t: 'text', ph: 'myVar' }, { k: 'vv', l: 'Value', t: 'text', ph: '42' }]),
  transform: new NodeDefinition('transform', 'Transform', 'd', '#7F77DD', '#EEEDFE', '&#8635;', 'Map data', [{ k: 'map', l: 'Expression', t: 'ta', ph: '{ id: input.id, v2: input.value*2 }' }]),
  filter: new NodeDefinition('filter', 'Filter', 'd', '#7F77DD', '#EEEDFE', '&#9661;', 'Filter items', [{ k: 'expr', l: 'Filter Expr', t: 'text', ph: 'item.active === true' }]),
};

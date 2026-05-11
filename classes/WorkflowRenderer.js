// Renderer & UI Manager
class WorkflowRenderer {
  constructor(workflow, definitions) {
    this.workflow = workflow;
    this.definitions = definitions;
    this.cw = document.getElementById('cw');
    this.cnv = document.getElementById('cnv');
    this.esvg = document.getElementById('esvg');
    this.dotsCanvas = document.getElementById('dots-canvas');
    this.zoomLabel = document.getElementById('zoom-label');
    this.panX = 0;
    this.panY = 0;
    this.scale = 1;
    this.isPanning = false;
    this.panStart = null;
    this.dragNodeId = null;
    this.dragNodeOffset = null;
    this.connFrom = null;
    this.dragType = null;
  }

  applyTransform() {
    this.cnv.style.transform = `translate(${this.panX}px,${this.panY}px) scale(${this.scale})`;
    this.cnv.style.transformOrigin = '0 0';
    this.esvg.style.transform = `translate(${this.panX}px,${this.panY}px) scale(${this.scale})`;
    this.esvg.style.transformOrigin = '0 0';
    this.drawDots();
    this.zoomLabel.textContent = Math.round(this.scale * 100) + '%';
  }

  drawDots() {
    const w = this.cw.offsetWidth;
    const h = this.cw.offsetHeight;
    this.dotsCanvas.width = w;
    this.dotsCanvas.height = h;
    const ctx = this.dotsCanvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const spacing = 22 * this.scale;
    const ox = ((this.panX % spacing) + spacing) % spacing;
    const oy = ((this.panY % spacing) + spacing) % spacing;
    const dark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)';
    for (let x = ox - spacing; x < w + spacing; x += spacing) {
      for (let y = oy - spacing; y < h + spacing; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  isCanvasBg(el) {
    return el === this.cw || el === this.dotsCanvas || el === this.cnv || el.id === 'hint' || (el.closest && el.closest('#hint'));
  }

  zoomAt(delta, mx, my) {
    const ns = Math.min(3, Math.max(0.2, this.scale + delta));
    this.panX = mx - (mx - this.panX) * (ns / this.scale);
    this.panY = my - (my - this.panY) * (ns / this.scale);
    this.scale = ns;
    this.applyTransform();
  }

  zoomBy(delta) {
    const r = this.cw.getBoundingClientRect();
    this.zoomAt(delta, r.width / 2, r.height / 2);
  }

  zoomFit() {
    const ids = Object.keys(this.workflow.nodes);
    if (!ids.length) {
      this.panX = 0;
      this.panY = 0;
      this.scale = 1;
      this.applyTransform();
      return;
    }
    const xs = ids.map(i => this.workflow.nodes[i].x);
    const ys = ids.map(i => this.workflow.nodes[i].y);
    const minX = Math.min(...xs) - 20;
    const maxX = Math.max(...xs) + 172;
    const minY = Math.min(...ys) - 20;
    const maxY = Math.max(...ys) + 80;
    const r = this.cw.getBoundingClientRect();
    const sx = r.width / (maxX - minX);
    const sy = r.height / (maxY - minY);
    this.scale = Math.min(1.2, Math.min(sx, sy) * 0.88);
    this.panX = (r.width - (maxX - minX) * this.scale) / 2 - minX * this.scale;
    this.panY = (r.height - (maxY - minY) * this.scale) / 2 - minY * this.scale;
    this.applyTransform();
  }

  renderNode(id) {
    const n = this.workflow.nodes[id];
    const d = this.definitions[n.type];
    let el = document.getElementById('wn-' + id);
    if (!el) {
      el = document.createElement('div');
      el.id = 'wn-' + id;
      this.cnv.appendChild(el);
    }
    el.className = 'wn' + (this.workflow.selectedNode === id ? ' sel' : '') + (n.st !== 'idle' ? ' ' + n.st : '');
    el.style.left = n.x + 'px';
    el.style.top = n.y + 'px';
    el.innerHTML = `
      <button class="xbtn" onclick="app.deleteNode('${id}')">x</button>
      <div class="pt pi" id="pi-${id}" onmousedown="app.startConn(event,'${id}','in')"></div>
      <div class="nh">
        <div class="ni" style="background:${d.bg};color:${d.color}">${d.icon}</div>
        <div class="ntitle">${d.label}</div>
        <div class="nst ${n.st !== 'idle' ? n.st : ''}"></div>
      </div>
      <div class="nb">${n.getConfigSummary(this.definitions)}</div>
      <div class="pt po" id="po-${id}" onmousedown="app.startConn(event,'${id}','out')"></div>
    `;
    el.onmousedown = (e) => this.nodeDown(e, id);
  }

  nodeDown(e, id) {
    if (e.target.classList.contains('pt') || e.target.classList.contains('xbtn')) return;
    e.stopPropagation();
    e.preventDefault();
    this.workflow.selectNode(id);
    this.renderNode(id);
    this.renderConfig(id);
    const r = this.cw.getBoundingClientRect();
    const wx = (e.clientX - r.left - this.panX) / this.scale;
    const wy = (e.clientY - r.top - this.panY) / this.scale;
    this.dragNodeId = id;
    this.dragNodeOffset = { x: wx - this.workflow.nodes[id].x, y: wy - this.workflow.nodes[id].y };
  }

  portPosWorld(nid, pt) {
    const n = this.workflow.nodes[nid];
    return pt === 'out' ? { x: n.x + 152, y: n.y + 36 } : { x: n.x, y: n.y + 36 };
  }

  startConn(e, nid, pt) {
    e.stopPropagation();
    e.preventDefault();
    this.connFrom = { nid, pt };
    document.addEventListener('mousemove', (e) => this.onConnMove(e));
    document.addEventListener('mouseup', (e) => this.onConnUp(e));
  }

  onConnMove(e) {
    if (!this.connFrom) return;
    const r = this.cw.getBoundingClientRect();
    const wx = (e.clientX - r.left - this.panX) / this.scale;
    const wy = (e.clientY - r.top - this.panY) / this.scale;
    const fp = this.portPosWorld(this.connFrom.nid, this.connFrom.pt === 'out' ? 'out' : 'in');
    let x1 = fp.x, y1 = fp.y, x2 = wx, y2 = wy;
    if (this.connFrom.pt === 'in') {
      x1 = wx;
      y1 = wy;
      x2 = fp.x;
      y2 = fp.y;
    }
    const cx = (x1 + x2) / 2;
    const d = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
    let pe = document.getElementById('prev-e');
    if (!pe) {
      pe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pe.id = 'prev-e';
      pe.className.baseVal = 'ep prev';
      this.esvg.appendChild(pe);
    }
    pe.setAttribute('d', d);
  }

  onConnUp(e) {
    document.getElementById('prev-e')?.remove();
    document.removeEventListener('mousemove', (e) => this.onConnMove(e));
    document.removeEventListener('mouseup', (e) => this.onConnUp(e));
    if (!this.connFrom) return;
    const r = this.cw.getBoundingClientRect();
    const wx = (e.clientX - r.left - this.panX) / this.scale;
    const wy = (e.clientY - r.top - this.panY) / this.scale;
    const oppPt = this.connFrom.pt === 'out' ? 'in' : 'out';
    let target = null;
    Object.keys(this.workflow.nodes).forEach(nid => {
      if (nid === this.connFrom.nid) return;
      const p = this.portPosWorld(nid, oppPt);
      if (Math.hypot(wx - p.x, wy - p.y) < 18) target = nid;
    });
    if (target) {
      const from = this.connFrom.pt === 'out' ? this.connFrom.nid : target;
      const to = this.connFrom.pt === 'out' ? target : this.connFrom.nid;
      this.workflow.addEdge(from, to);
      this.renderEdges();
    }
    this.connFrom = null;
  }

  renderEdges() {
    while (this.esvg.firstChild) this.esvg.removeChild(this.esvg.firstChild);
    this.workflow.edges.forEach(edge => {
      const fp = this.portPosWorld(edge.from, 'out');
      const tp = this.portPosWorld(edge.to, 'in');
      const cx = (fp.x + tp.x) / 2;
      const d = `M${fp.x},${fp.y} C${cx},${fp.y} ${cx},${tp.y} ${tp.x},${tp.y}`;
      const del = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      del.className.baseVal = 'edel';
      del.setAttribute('d', d);
      del.onclick = () => {
        this.workflow.deleteEdge(edge.id);
        this.renderEdges();
      };
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.className.baseVal = 'ep';
      p.setAttribute('d', d);
      this.esvg.appendChild(del);
      this.esvg.appendChild(p);
    });
  }

  renderConfig(id) {
    const n = this.workflow.nodes[id];
    const d = this.definitions[n.type];
    document.getElementById('rph').textContent = d.label;
    const b = document.getElementById('rpb');
    if (!d.fields.length) {
      b.innerHTML = '<div style="color:var(--color-text-tertiary);font-size:11px;padding-top:10px;">No config needed</div>';
      return;
    }
    let h = '';
    d.fields.forEach(f => {
      const v = n.cfg[f.k] || '';
      h += `<div class="fl">${f.l}</div>`;
      if (f.t === 'sel') {
        h += `<select class="fi" onchange="app.updateNodeConfig('${id}','${f.k}',this.value)">`;
        f.opts.forEach(o => h += `<option${v === o ? ' selected' : ''}>${o}</option>`);
        h += `</select>`;
      } else if (f.t === 'ta') {
        h += `<textarea class="fta" placeholder="${f.ph || ''}" onchange="app.updateNodeConfig('${id}','${f.k}',this.value)">${v}</textarea>`;
      } else {
        h += `<input class="fi" type="text" placeholder="${f.ph || ''}" value="${v}" oninput="app.updateNodeConfig('${id}','${f.k}',this.value)">`;
      }
    });
    b.innerHTML = h;
  }

  showHint() {
    document.getElementById('hint').style.display = Object.keys(this.workflow.nodes).length ? 'none' : 'block';
  }

  clearUI() {
    Object.keys(this.workflow.nodes).forEach(id => document.getElementById('wn-' + id)?.remove());
    while (this.esvg.firstChild) this.esvg.removeChild(this.esvg.firstChild);
    document.getElementById('rph').textContent = 'Node Config';
    document.getElementById('rpb').innerHTML = '<div style="color:var(--color-text-tertiary);font-size:11px;padding-top:16px;text-align:center;">Select a node</div>';
    this.showHint();
  }
}

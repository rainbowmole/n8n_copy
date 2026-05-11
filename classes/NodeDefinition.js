// Node Definition Metadata
class NodeDefinition {
  constructor(key, label, cat, color, bg, icon, desc, fields = []) {
    this.key = key;
    this.label = label;
    this.cat = cat;
    this.color = color;
    this.bg = bg;
    this.icon = icon;
    this.desc = desc;
    this.fields = fields;
  }
}

var Class = require('../class');

var dummy = function () {};

function define(exports, name, properties, constructor, parent) {
  if (parent === undefined) {
    parent = exports.Node;
  } else if (parent === null) {
    parent = Class;
  }
  if (constructor === null) {
    constructor = dummy;
  }
  var code = constructor.toString().replace(/function\s*\w+?\(/, 'function ' + name + '(') + 'return ' + name;
  var constructor = new Function(code);
  var newClass = parent.extend(constructor, properties);
  exports[name] = newClass;
  return newClass;
}
exports.define = define;
/**
 * Node
 */
define(exports, 'Node', {
  clone: function() {
      return new this.constructor(this);
  },
  desc: "Base class of all AST nodes",
  _walk: function(visitor) {
      return visitor._visit(this);
  },
  walk: function(visitor) {
      return this._walk(visitor); // not sure the indirection will be any help
  },
  warn: function(txt, props) {
    if (this.formatWarnning) {
      this.formatWarnning(txt, props);
    } else {
      console.log(txt, props);
    }
  }
}, null, null);
/**
 * Token
 */
define(exports, 'Token', {
  type: null,
  value: null,
  line: 0,
  col: 0,
  pos: 0,
  endpos: 0,
  nlb: null,
  comments_before: [],
  file: null
}, null, null);

/**
 * Constant
 */
define(exports, 'Constant', {
  desc: 'base class for all constants'
  getValue: function () {
    return this.value;
  }
}, null, null);
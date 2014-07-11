var Base = require('./base');
var define = Base.define;
var Constant = Base.Constant;

define(exports, 'String', {
  desc: 'a string literal',
  value: null
}, null, Constant);

define(exports, 'Number', {
  desc: 'a number literal',
  value: 0
}, null, Constant);

define(exports, 'RegExp', {
  desc: 'a regexp literal',
  value: null
}, null, Constant);

define(exports, 'Atom', {
  desc: 'base class for atoms',
  value: null
}, null, Constant);

define(exports, 'Null', {
  desc: 'The `null` atom',
  value: null
}, null, exports.Atom);

define(exports, 'NaN', {
  desc: 'The not a number atom',
  value: 0/0
}, null, exports.Atom);

define(exports, 'Undefined', {
  desc: 'The `undefined` value',
  value: (function(){}())
}, null, exports.Atom);


define(exports, "Hole", {
  desc: "A hole in an array, [,]",
  value: (function(){}())
}, null, exports.Atom);


define(exports, 'Infinity', {
  desc: "The `Infinity` value",
  value: 1/0
}, null, exports.Atom);

define(exports, 'Boolean', {
  desc: "base class for booleans value",
  value: 1/0
}, null, exports.Atom);

define(exports, 'False', {
  desc: 'the `false` atom',
  value: false
}, null, exports.Boolean);

define(exports, 'True', {
  desc: 'the `true` atom',
  value: true
}, null, exports.Boolean);
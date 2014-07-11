function Class() {};
/**
 * Create a new Class that inherits from this class
 * @param  {Function} fn    [description]
 * @param  {[type]}   proto [description]
 * @return {[type]}         [description]
 */
Class.extend = function (constructor, proto) {
  if (typeof constructor !== 'function' && !proto) {
    proto = constructor;
    constructor = function () {};
  } else if (!constructor) {
    constructor = function () {};
  }
  var newClassName = constructor.name;
  var argLens = constructor.length;
  var code = 'return function ' + newClassName + '(){';
  code += 'var args = Array.prototype.slice.apply(arguments);';
  code += 'sfn.apply(this, args);';
  code += 'fn.apply(this, args);';
  code += '};';
  var newClass = new Function('fn', 'sfn', code)(constructor, this);
  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  var superClass = this;
  var prototype = new superClass;
  // The dummy class constructor
  var i;
  // Populate our constructed prototype object

  if (proto) {
    for(i in proto) {
      if (proto.hasOwnProperty(i)) {
        prototype[i] = proto[i];
      }
    }
  }
  // setup super functions
  prototype._super = superClass;

  newClass.prototype = prototype;
  newClass.prototype.constructor = newClass;
  // And make this class extendable
  newClass.extend = arguments.callee;

  return newClass;
};

module.exports = Class;
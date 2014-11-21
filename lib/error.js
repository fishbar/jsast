function JsParseError(message, line, col, pos) {
  this.message = message;
  this.line = line;
  this.col = col;
  this.pos = pos;
  this.stack = new Error().stack;
}

JsParseError.prototype.toString = function () {
  return this.message + ' (line: ' + this.line + ', col: ' + this.col + ', pos: ' + this.pos + ')' + '\n\n' + this.stack;
};

exports.JsParseError = JsParseError;
var Base = require('./base');
var Block = require('./statements').Block;
var define = Base.define;


define(exports, 'Scope', {
  desc: 'Base class for all statements introducing a lexical scope',
  directives: [],
  variables: [],
  functions: [],
  uses_with: false,
  uses_eval: false,
  parent_scope: null,
  enclosed: [],
  cname: null
}, null, Block);

define(exports, 'Toplevel', {
  desc: 'the toplevel scope',
  globals: {},
  wrap_enclose: function (arg_parameter_pairs) {
    var self = this;
    var args = [];
    var parameters = [];

    arg_parameter_pairs.forEach(function(pair) {
      var splitAt = pair.lastIndexOf(":");
      args.push(pair.substr(0, splitAt));
      parameters.push(pair.substr(splitAt + 1));
    });

    var wrapped_tl = "(function(" + parameters.join(",") + "){ '$ORIG'; })(" + args.join(",") + ")";
    wrapped_tl = parse(wrapped_tl);
    wrapped_tl = wrapped_tl.transform(new TreeTransformer(function before(node){
      if (node instanceof AST_Directive && node.value == "$ORIG") {
        return MAP.splice(self.body);
      }
    }));
    return wrapped_tl;
  },
  wrap_commonjs: function(name, export_all) {
      var self = this;
      var to_export = [];
      if (export_all) {
        self.figure_out_scope();
        self.walk(new TreeWalker(function(node){
          if (node instanceof AST_SymbolDeclaration && node.definition().global) {
            if (!find_if(function(n){ return n.name == node.name }, to_export))
              to_export.push(node);
          }
        }));
      }
      var wrapped_tl = "(function(exports, global){ global['" + name + "'] = exports; '$ORIG'; '$EXPORTS'; }({}, (function(){return this}())))";
      wrapped_tl = parse(wrapped_tl);
      wrapped_tl = wrapped_tl.transform(new TreeTransformer(function before(node){
        if (node instanceof AST_SimpleStatement) {
          node = node.body;
            if (node instanceof AST_String) {
              switch (node.getValue()) {
              case "$ORIG":
                return MAP.splice(self.body);
              case "$EXPORTS":
                var body = [];
                to_export.forEach(function(sym){
                  body.push(new AST_SimpleStatement({
                    body: new AST_Assign({
                      left: new AST_Sub({
                        expression: new AST_SymbolRef({ name: "exports" }),
                        property: new AST_String({ value: sym.name }),
                      }),
                      operator: "=",
                      right: new AST_SymbolRef(sym),
                    }),
                  }));
                });
                return MAP.splice(body);
              }
            }
        }));
        return wrapped_tl;
      }
    }
}, null, exports.Scope);

define(exports, 'Lambda', {
  desc: 'Base class for functions',
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      if (this.name) this.name._walk(visitor);
      this.argnames.forEach(function(arg){
        arg._walk(visitor);
      });
      walk_body(this, visitor);
    });
  }
}, null, exports.Scope);


define(exports, 'Accessor', {
  desc: 'A setter/getter function.  The `name` property is always null.'
}, null, exports.Lambda);

define(exports, 'Function', {
  desc: "A function expression"
}, null, exports.Lambda);

define(exports, 'Defun', {
    desc: "A function definition"
}, null, exports.Lambda);
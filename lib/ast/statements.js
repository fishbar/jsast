var Base = require('./base')
var define = Base.define;

/**
 * Statement, base class of statements
 */
define(exports, 'Statement', {
  desc: 'Base class of all statements'
});

define(exports, 'SimpleStatement', {
  desc: 'A statement consisting of an expression, like "a = b + c;"',
  body: null // an expression node (should not be instanceof AST_Statement)
  _walk: function (visitor) {
    return visitor._visit(this, function(){
      this.body._walk(visitor);
    });
  }
}, null, exports.Statement);

define(exports, 'Debugger', {
  desc: 'the debugger statement'
}, null, exports.Statement);


define(exports, 'Directive', {
  desc: 'a directive, like "use strict"',
  value: '', // The value of this directive as a plain string (it's not an AST_String!)
  scope: null // The scope that this directive affects
}, null, exports.Statement);


function walk_body(node, visitor) {
    if (node.body instanceof AST_Statement) {
        node.body._walk(visitor);
    } else {
      node.body.forEach(function (stat) {
        stat._walk(visitor);
      });
    }
};

define(exports, 'Block', {
  desc: 'A list of statements (usually bracketed)',
  body: null,
  _walk: function(visitor) {
    return visitor._visit(this, function () {
      walk_body(this, visitor);
    });
  }
}, null, exports.Statement);

define(exports, 'BlockStatement', {
  desc: 'A block statement, diff with statement ?',
  _walk: function(visitor) {
    return visitor._visit(this);
  }
}, null, exports.Statement);

define(exports, 'EmptyStatement', {
  desc: 'The empty statement (empty block or simply a semicolon)',
  _walk: function(visitor) {
    return visitor._visit(this);
  }
}, null, exports.Statement);

define(exports, 'StatementWithBody', {
  desc: 'Base class for all statements that contain one nested body: `For`, `ForIn`, `Do`, `While`, `With`',
  body: null,
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      this.body._walk(visitor);
    });
  }
}, null, exports.Statement);

define(exports, 'LabeledStatement', {
  desc: 'a labeled statement, like: `name:`',
  label: null, // [Label]
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      this.label._walk(visitor);
      this.body._walk(visitor);
    });
  }
}, null, exports.StatementWithBody);

define(exports, 'IterationStatement', {
  desc: 'Internal class.  All loops inherit from it.'
}, null, exports.StatementWithBody);

define(exports, 'DoWhileLoop', {
  desc: 'Base class for do/while statements'
  condition: null,
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      this.condition._walk(visitor);
      this.body._walk(visitor);
    });
  }
}, null, exports.IterationStatement);

define(exports, 'Do', {
  desc: 'A `do` statement',
}, null, exports.DoWhileLoop);


define(exports, 'While', {
  desc: 'A `while` statement',
}, null, exports.DoWhileLoop);

define(exports, 'For', {
  desc: 'A `for` statement, `for(var i = 0; i < 10; i++){}`',
  init: null,
  condition: null,
  step: null,
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      if (this.init) this.init._walk(visitor);
      if (this.condition) this.condition._walk(visitor);
      if (this.step) this.step._walk(visitor);
      this.body._walk(visitor);
    });
  }
}, null, exports.IterationStatement);


define(exports, 'ForIn', {
  desc: 'A `for(a in obj)` statement',
  init: null,
  name: null,
  object: null,
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      this.init._walk(visitor);
      this.object._walk(visitor);
      this.body._walk(visitor);
    });
  }
}, null, exports.IterationStatement);

define(exports, 'With', {
  desc: 'A `with` statement',
  expression: null,
  _walk: function(visitor) {
    return visitor._visit(this, function(){
      this.expression._walk(visitor);
      this.body._walk(visitor);
    });
  }
}, null, exports.StatementWithBody);

var AST_Definitions = DEFNODE("Definitions", "definitions", {
    $documentation: "Base class for `var` or `const` nodes (variable declarations/initializations)",
    $propdoc: {
        definitions: "[AST_VarDef*] array of variable definitions"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.definitions.forEach(function(def){
                def._walk(visitor);
            });
        });
    }
}, AST_Statement);

var AST_Var = DEFNODE("Var", null, {
    $documentation: "A `var` statement"
}, AST_Definitions);

var AST_Const = DEFNODE("Const", null, {
    $documentation: "A `const` statement"
}, AST_Definitions);

var AST_VarDef = DEFNODE("VarDef", "name value", {
    $documentation: "A variable declaration; only appears in a AST_Definitions node",
    $propdoc: {
        name: "[AST_SymbolVar|AST_SymbolConst] name of the variable",
        value: "[AST_Node?] initializer, or null of there's no initializer"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.name._walk(visitor);
            if (this.value) this.value._walk(visitor);
        });
    }
});

/* -----[ IF ]----- */

var AST_If = DEFNODE("If", "condition alternative", {
    $documentation: "A `if` statement",
    $propdoc: {
        condition: "[AST_Node] the `if` condition",
        alternative: "[AST_Statement?] the `else` part, or null if not present"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.condition._walk(visitor);
            this.body._walk(visitor);
            if (this.alternative) this.alternative._walk(visitor);
        });
    }
}, AST_StatementWithBody);

/* -----[ SWITCH ]----- */

var AST_Switch = DEFNODE("Switch", "expression", {
    $documentation: "A `switch` statement",
    $propdoc: {
        expression: "[AST_Node] the `switch` “discriminant”"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            walk_body(this, visitor);
        });
    }
}, AST_Block);

var AST_SwitchBranch = DEFNODE("SwitchBranch", null, {
    $documentation: "Base class for `switch` branches",
}, AST_Block);

var AST_Default = DEFNODE("Default", null, {
    $documentation: "A `default` switch branch",
}, AST_SwitchBranch);

var AST_Case = DEFNODE("Case", "expression", {
    $documentation: "A `case` switch branch",
    $propdoc: {
        expression: "[AST_Node] the `case` expression"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.expression._walk(visitor);
            walk_body(this, visitor);
        });
    }
}, AST_SwitchBranch);

/* -----[ EXCEPTIONS ]----- */

var AST_Try = DEFNODE("Try", "bcatch bfinally", {
    $documentation: "A `try` statement",
    $propdoc: {
        bcatch: "[AST_Catch?] the catch block, or null if not present",
        bfinally: "[AST_Finally?] the finally block, or null if not present"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            walk_body(this, visitor);
            if (this.bcatch) this.bcatch._walk(visitor);
            if (this.bfinally) this.bfinally._walk(visitor);
        });
    }
}, AST_Block);

var AST_Catch = DEFNODE("Catch", "argname", {
    $documentation: "A `catch` node; only makes sense as part of a `try` statement",
    $propdoc: {
        argname: "[AST_SymbolCatch] symbol for the exception"
    },
    _walk: function(visitor) {
        return visitor._visit(this, function(){
            this.argname._walk(visitor);
            walk_body(this, visitor);
        });
    }
}, AST_Block);

var AST_Finally = DEFNODE("Finally", null, {
    $documentation: "A `finally` node; only makes sense as part of a `try` statement"
}, AST_Block);

var AST_Jump = DEFNODE("Jump", null, {
    $documentation: "Base class for “jumps” (for now that's `return`, `throw`, `break` and `continue`)"
}, AST_Statement);

var AST_Exit = DEFNODE("Exit", "value", {
    $documentation: "Base class for “exits” (`return` and `throw`)",
    $propdoc: {
        value: "[AST_Node?] the value returned or thrown by this statement; could be null for AST_Return"
    },
    _walk: function(visitor) {
        return visitor._visit(this, this.value && function(){
            this.value._walk(visitor);
        });
    }
}, AST_Jump);

var AST_Return = DEFNODE("Return", null, {
    $documentation: "A `return` statement"
}, AST_Exit);

var AST_Throw = DEFNODE("Throw", null, {
    $documentation: "A `throw` statement"
}, AST_Exit);

var AST_LoopControl = DEFNODE("LoopControl", "label", {
    $documentation: "Base class for loop control statements (`break` and `continue`)",
    $propdoc: {
        label: "[AST_LabelRef?] the label, or null if none",
    },
    _walk: function(visitor) {
        return visitor._visit(this, this.label && function(){
            this.label._walk(visitor);
        });
    }
}, AST_Jump);

var AST_Break = DEFNODE("Break", null, {
    $documentation: "A `break` statement"
}, AST_LoopControl);

var AST_Continue = DEFNODE("Continue", null, {
    $documentation: "A `continue` statement"
}, AST_LoopControl);
/*
 * utils function here
 */
'use strict';

var Class = require('./class');
/**
 * Define a Class
 * @param {String} name     nodeName
 * @param {Object}  properties    properties
 * @param {Object} parent   parent Class
 */
exports.define = function (name, properties, parent) {
  if (!parent) {
    parent = Class;
  }
  var code = 'function ' + name + '(){}return ' + name;

  var constructor = new Function(code)();
  var newClass = parent.extend(constructor, properties);
  newClass.prototype._name = name;
  return newClass;
};

exports.characters = function(str) {
    return str.split('');
};

exports.makePredicate = function (words) {
  if (!(words instanceof Array)) {
    words = words.split(' ');
  }
  var f = '', cats = [], i;
  out:
    for (i = 0; i < words.length; ++i) {
      for (var j = 0; j < cats.length; ++j) {
        if (cats[j][0].length === words[i].length) {
          cats[j].push(words[i]);
          continue out;
        }
      }
      cats.push([words[i]]);
    }

  function compareTo(arr) {
    if (arr.length === 1) {
      return f += 'return str === ' + JSON.stringify(arr[0]) + ';';
    }
    f += 'switch(str){';
    for (var i = 0; i < arr.length; ++i) {
      f += 'case ' + JSON.stringify(arr[i]) + ':';
    }
    f += 'return true}return false;';
  }
  // When there are more than three length categories, an outer
  // switch first dispatches on the lengths, to save on comparisons.
  if (cats.length > 3) {
    cats.sort(function (a, b) {
      return b.length - a.length;
    });
    f += 'switch(str.length){';
    for (i = 0; i < cats.length; ++i) {
      var cat = cats[i];
      f += 'case ' + cat[0].length + ':';
      compareTo(cat);
    }
    f += '}';
    // Otherwise, simply generate a flat `switch` statement.
  } else {
    compareTo(words);
  }
  return new Function('str', f);
};
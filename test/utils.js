var expect = require('expect.js');
var Class = require('../lib/class');
var testMod = require('../lib/utils');

describe('lib/utils', function () {

  describe('define(name, properties, parent)', function () {
    it('should return a newClass with custom constructor, without parent', function () {
      var Test = testMod.define('Test',);
      var test = Test.create(1, 2);
      expect(test.value).to.be(3);
    });
    it('should return a newClass without constructor', function () {
      var Test = testMod.define('Test');
      var test = new Test();
      expect(test instanceof Test).to.be.ok();
      expect(test instanceof Class).to.be.ok();
    });
  });

});
var CFS = require('../lib/index');
var should = require('should')

describe('CFS', function() {
  describe('#init()', function() {
    it('should return a CFS object', function() {
      CFS.init().should.be.a('object').and.have.property('cache');
    });
  });
  
  describe('#findFile()', function() {
    it('should return false on error', function() {
      CFS.findFile('dugi', 'howser').should.be.a(false);
    });
  });
}); 
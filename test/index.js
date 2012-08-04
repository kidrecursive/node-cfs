var CFS = require('../lib/index');
var should = require('should')

describe('CFS', function() {
  describe('#init()', function() {
    it('should return a CFS object', function() {
      CFS.init(
        __dirname + '/example/application', 
        __dirname + '/example/modules',
         __dirname + '/example/system', 
         __dirname + '/example/public'
      ).should.be.an.instanceOf(Object);
    });

    it('should set the require paths', function() {
      CFS.requirePaths.should.be.an.instanceOf(Array);
      CFS.requirePaths.should.be.length(2);
      CFS.requirePaths.should.eql([
        __dirname + '/example/application', 
        __dirname + '/example/system']
      );
    });
  });

  describe('#modules()', function() {
    it('should do nothing without an array', function() {
      CFS.modules('auth');
      CFS.requirePaths.should.be.length(2);
      CFS.requirePaths.should.eql([
        __dirname + '/example/application', 
        __dirname + '/example/system']
      );
    });

    it('should add modules to the require path', function() {
      CFS.modules(['auth', 'stats']);
      CFS.requirePaths.should.be.length(4);
      CFS.requirePaths.should.eql([
        __dirname + '/example/application', 
        __dirname + '/example/modules/auth', 
        __dirname + '/example/modules/stats', 
        __dirname + '/example/system']
      );
    });

    it('should reset the require path', function() {
      CFS.modules([]);
      CFS.requirePaths.should.be.length(2);
      CFS.requirePaths.should.eql([
        __dirname + '/example/application', 
        __dirname + '/example/system']
      );
    });

    it('should run a modules init.js script', function() {
      CFS.modules(['auth']);
      global.testModuleInitialized.should.equal(true);
    });
  });

  describe('#findFile()', function() {
    it('should return false on file not found', function() {
      CFS.findFile('hello', 'world').should.equal(false);
    });
  });
});

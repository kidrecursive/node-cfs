var fs = require('fs');

/**
 * Static object to manage the Cascading File System
 */
var CFS = {};

CFS.init = function(appPath, modPath, sysPath, docRoot) {
  this.appPath = appPath;
  this.modPath = modPath;
  this.sysPath = sysPath;
  this.docRoot = docRoot;

  this.cache = {};
  this.requirePaths = [appPath, sysPath];

  return this;
};

/**
 * Check if the file exists and is not a directory
 * @param {String} file path to check.
 * @api private
 */
var checkFile = function(path) {
  var stats = false;
  try {
    stats = fs.statSync(path);
  } catch (e) {
    return false;
  }

  if (stats && !stats.isDirectory()) {
    return true;
  }
  return false;
};

/**
 * Searches for a file in the Cascading Filesystem, and
 * returns the path to the file that has the highest precedence, so that it
 * can be required.
 *
 * When searching the 'config', 'messages', or 'i18n' directories, or when
 * the `array` flag is set to true, an array of all the files that match
 * that path in the Cascading Filesystem will be returned.
 * These files will return arrays which must be merged together.
 *
 * Examples:
 *
 *    // Returns an absolute path to views/template.php
 *    CFS.findFile('views', 'template');
 *
 *    // Returns an absolute path to media/css/style.css
 *    CFS.findFile('media', 'css/style', 'css');
 *
 *    // Returns an array of all the 'mimes' configuration files
 *    CFS.findFile('config', 'mimes');
 *
 * @param {String} directory name (views, i18n, classes, extensions, etc.)
 * @param {String} filename with subdirectory
 * @param {String} extension to search for
 * @param {Boolean} return an array of files?
 * @return {Array} a list of files when array is TRUE
 * @return {string} single file path
 * @api public
 */
CFS.findFile = function(dir, file, ext, array) {
  if (ext == null) {
    ext = 'js';
  }
  ext = '.' + ext;

  if (array == null) {
    array = false;
  }

  // Create a partial path of the filename
  var path = dir + '/' + file + ext;

  // Return the cached value if it exists
  if (this.cache[path]) {
    return this.cache[path];
  }

  // Reverse search paths for certain directories
  if (array || ['config', 'i18n', 'messages'].indexOf(dir) !== -1) {
    var found = [];
    var reversedArray = this.requirePaths.slice(0).reverse();

    for (var i = 0, ilen = reversedArray.length; i < ilen; i++) {
      if (checkFile(reversedArray[i] + '/' + path)) {
        found.push(reversedArray[i] + '/' + path);
      }
    }
  } else {
    var found = false;

    for (var i = 0, ilen = this.requirePaths.length; i < ilen; i++) {
      if (checkFile(this.requirePaths[i] + '/' + path)) {
        found = this.requirePaths[i] + '/' + path;
        break;
      }
    }
  }

  this.cache[path] = found;
  return found;
};

/**
 * Provides loading of classes that follow Kohana's class
 * naming conventions.
 *
 * Class names are converted to file names by making the class name
 * lowercase and converting underscores to slashes:
 *
 * Examples:
 *
 *    //Loads classes/my/class/name.js
 *     CFS.load('My_Class_Name');
 *
 * @param {String} class name
 * @return {Mixed}
 * @api public
 */
CFS.load = function(className) {
  // Transform the class name into a path
  var file = className.replace('_', '/').toLowerCase();
  var foundFile = this.findFile('classes', file);
  if (foundFile) {
    // Class File found, include and return it
    return require(foundFile);
  }
  return false;
};

/*
 * Initializes the modules. Module paths may be relative
 * or absolute, but must point to a directory:
 *
 * Examples:
 *
 *    // Load the modules Auth and Email
 *    CFS.modules(['auth', 'email'])
 *
 * @param {Array} list of module paths
 * @api public
 */
CFS.modules = function(moduleList) {
  if (moduleList == null || moduleList.length === 0) {
    return;
  }

  // Replace the existing require paths
  this.requirePaths = [this.appPath];

  for (var i = 0, ilen = moduleList.length; i < ilen; i++) {
    var modulePath = this.modPath + '/' + moduleList[i];
    // Make sure the module exists
    if (fs.statSync(modulePath).isDirectory()) {
      this.requirePaths.push(modulePath);

      // Initialize the module if an initialization script exists
      if (fs.statSync(modulePath + '/init.js').isFile()) {
        require(modulePath + '/init');
      }
    }
  }
  this.requirePaths.push(this.sysPath);
};

module.exports = CFS;

var Globule = require('globule'),
    File = require('fs'),
    Path = require('path');

module.exports = function(grunt) {
  grunt.registerMultiTask('jsframe', 'build polyglot files', function () {
    var jsf = require('jsframe'),
        dest = this.data.dest,
        src = this.data.src;

    grunt.file.mkdir(dest);

    src.forEach( function(pattern) {
      var files = Globule.find(pattern);
      files.forEach( function(filePath) {
        var basename = Path.basename(filePath),
            targetName = Path.join(dest, basename) + '.html',
            outFd = File.openSync(targetName, 'w');

        jsf.process(filePath, outFd);
        File.closeSync(outFd);
      });
    });
  });
};

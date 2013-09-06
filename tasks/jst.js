var Path = require('path');

module.exports = function(grunt) {
  grunt.registerTask("jst", function () {
    grunt.file.expand({ cwd: 'template/' }, '**/*.jst').forEach(function(templatePath) {
      var dir = Path.dirname(templatePath),
          base = Path.basename(templatePath, Path.extname(templatePath));

      grunt.file.mkdir(Path.join('tmp/lib/', dir));
      grunt.file.write(Path.join('tmp/lib/', dir, base + '.js'), grunt.template.process(grunt.file.read('template/' + templatePath)));
    });
  });
};

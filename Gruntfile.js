module.exports = function(grunt) {
  var buildTasks,
      transpileTasks = ['transpile'],
      fixupLinefeed = grunt.util.linefeed !== '\n';

  require('matchdep').
    filterDev('grunt-*').
    filter(function(name){ return name !== 'grunt-cli'; }).
      forEach(grunt.loadNpmTasks);

  grunt.loadTasks('tasks');

  // Alias tasks for the most common sets of tasks.
  // Most of the time, you will use these.

  // By default, (i.e., if you invoke `grunt` without arguments), do
  // a new build.
  this.registerTask('default', ['build']);

  if (fixupLinefeed) {
    transpileTasks = ['lineending:lib', 'copy:LFlib'].
                      concat(transpileTasks).
                      concat(['lineending:amd', 'copy:CRLFamd']);
  }

  buildTasks = [
    'clean',
    'jshint',
    'copy:lib',         // reorganize folder
    'jst',
  ].concat(transpileTasks).concat([
    'concat:amd',       // generate conductor.amd.js
    'concat:amdDev',
    'concat:browser',
    'concat:browserDev',
  ]);

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of Conductor.js", buildTasks);

  // Run a server. This is ideal for running the QUnit tests in the browser.
  this.registerTask('server', ['prepare_test', 'connect', 'watch']);

  function config(configFileName) {
    return require('./configurations/' + configFileName);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ["dist/*", "tmp/*"],
    concat: config('concat'),
    connect: config('connect'),
    rename: config('rename'),
    copy: config('copy'),
    jshint: config('jshint'),
    lineending: config('lineending'),
    'saucelabs-qunit': config('saucelabs-qunit'),
    transpile: config('transpile'),
    watch: config('watch'),
  });

  grunt.registerTask('prepare_test', "Setup the test environment", ['build', 'concat:tests', 'copy:tests', 'rename:tests', 'copy:testsVendor', 'copy:example']);
  grunt.registerTask('test', "Run full test suite", ['prepare_test', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('test:ie', "Run tests suite in IE", ['prepare_test', 'connect', 'saucelabs-qunit:ie']);
  grunt.registerTask('test:safari', "Run tests suite in Safari", ['prepare_test', 'connect', 'saucelabs-qunit:safari']);
  grunt.registerTask('test:chrome', "Run tests suite in Chrome", ['prepare_test', 'connect', 'saucelabs-qunit:chrome']);
  grunt.registerTask('test:firefox', "Run tests suite in Firefox", ['prepare_test', 'connect', 'saucelabs-qunit:firefox']);
};

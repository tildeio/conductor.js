module.exports = function(grunt) {
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

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of Conductor.js", [
    'clean',
    'jshint',
    'copy:lib',         // reorganize folder
    'jst',
    'transpile',        // convert conductor files to amd modules
    'concat:amd',       // generate conductor.amd.js
    'concat:browser',
    'jsframe:conductor' // create polyglot
  ]);

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
    copy: config('copy'),
    jshint: config('jshint'),
    'saucelabs-qunit': config('saucelabs-qunit'),
    transpile: config('transpile'),
    watch: config('watch'),
    symlink: config('symlink'),

    jsframe: {
      conductor: {
        src: ['tmp/browser/<%= pkg.name %>-<%= pkg.version %>.js'],
        dest: 'dist'
      }
    },
  });

  grunt.registerTask('prepare_test', "Setup the test environment", ['build', 'concat:tests', 'copy:tests', 'copy:testsVendor', 'symlink']);
  grunt.registerTask('test', "Run full test suite", ['prepare_test', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('test:ie', "Run tests suite in IE", ['prepare_test', 'connect', 'saucelabs-qunit:ie']);
  grunt.registerTask('test:safari', "Run tests suite in Safari", ['prepare_test', 'connect', 'saucelabs-qunit:safari']);
  grunt.registerTask('test:chrome', "Run tests suite in Chrome", ['prepare_test', 'connect', 'saucelabs-qunit:chrome']);
  grunt.registerTask('test:firefox', "Run tests suite in Firefox", ['prepare_test', 'connect', 'saucelabs-qunit:firefox']);
};

module.exports = function(grunt) {
  var exec = require('child_process').exec;

  // Alias tasks for the most common sets of tasks.
  // Most of the time, you will use these.

  // By default, (i.e., if you invoke `grunt` without arguments), do
  // a new build.
  this.registerTask('default', ['build']);

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of Conductor.js", ['clean', 'jshint', 'concat:conductor', 'transpile', 'concat:dist']);

  // Build a dev version of the library
  this.registerTask('build-dev', "Builds a development version of Conductor.js", ['clean', 'concat:conductor', 'transpile', 'concat:dist']);

  // Run a server. This is ideal for running the QUnit tests in the browser.
  this.registerTask('server', ['concat:tests', 'build-dev', 'connect', 'watch']);

  this.registerTask('tutorial:retag', function () {
    var done = this.async();

    exec('git log -n 1 --format=%s | grep -q -p ^Tutorial', function (sin, sout, serr) {
      if (sin instanceof Error) {
        grunt.fail.fatal("The commit message of HEAD does not begin with 'Tutorial:'.  You must run 'tutorial:retag' from the last tutorial commit.");
      }
    });

    exec('git rev-list --reverse tutorial-setup..', function (sin, sout, serr) {
      var lastSha, cmd;
      sout.replace(/\n$/, '').split("\n").forEach(function (sha, i) {
        var cmd = "git tag -f tutorial-" + (i+1) + " " + sha;
        exec(cmd);
        grunt.log.write(cmd + "\n");
        lastSha = sha;
      });

      cmd = "git tag -f tutorial " + lastSha;
      exec(cmd);
      grunt.log.write(cmd + "\n");

      done();
    });
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {},

      options: {
        port: 8000,
        base: '.'
      }
    },

    watch: {
      files: ['lib/**', 'vendor/*', 'test/tests/*'],
      tasks: ['build-dev', 'concat:tests']
    },

    transpile: {
      amd: {
        options: {
          format: 'amd',
          name: 'conductor'
        },

        src: "tmp/conductor.js",
        dest: "tmp/conductor.amd.js"
      },

      globals: {
        options: {
          name: 'conductor',
          format: 'globals'
        },

        src: "tmp/conductor.js",
        dest: "tmp/conductor.browser.js"
      }
    },

    clean: ["dist"],

    concat: {
      conductor: {
        src: ['lib/conductor.js', 'lib/utils/*.js', 'lib/conductor/*.js', 'lib/consumers/*.js', 'lib/services/*.js', 'lib/services.js'],
        dest: 'tmp/conductor.js'
      },

      tests: {
        src: ['test/test_helpers.js', 'test/tests/**/*_test.js'],
        dest: 'tmp/conductor_tests.js'
      },

      dist: {
        src: ['lib/loader.js', 'vendor/rsvp.amd.js', 'vendor/oasis.amd.js', 'tmp/conductor.browser.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/tests/**/*.js']
    }
  });

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Multi-task for es6-module-transpiler
  this.registerMultiTask('transpile', "Transpile ES6 modules into AMD, CJS or globals", function() {
    var Compiler = require("es6-module-transpiler/lib/compiler");

    var options = this.options({
      format: 'amd'
    });

    this.files.forEach(function(f) {
      var contents = f.src.map(function(path) {
        var compiler = new Compiler(grunt.file.read(path), options.name, options);
        var format;

        switch (options.format) {
          case 'amd':
            console.log("Compiling " + path + " to AMD");
            format = compiler.toAMD;
            break;
          case 'globals':
            format = compiler.toGlobals;
            break;
          case 'commonjs':
            format = compiler.toCJS;
            break;
        }
        return format.call(compiler);
      });

      grunt.file.write(f.dest, contents);
    });
  });


};

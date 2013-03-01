module.exports = function(grunt) {
  // Alias tasks for the most common sets of tasks.
  // Most of the time, you will use these.

  // By default, (i.e., if you invoke `grunt` without arguments), do
  // a new build.
  this.registerTask('default', ['build']);

  // Run the QUnit tests in a headless PhantomJS instance.
  this.registerTask('test', ['connect', 'qunit']);

  // Build a new version of the library
  this.registerTask('build', ['clean', 'concat:conductor', 'transpile', 'concat:dist']);

  // Run a server. This is ideal for running the QUnit tests in the browser.
  this.registerTask('server', ['concat:tests', 'build', 'connect', 'watch']);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {},

      options: {
        port: 9292,
        base: '.'
      }
    },

    watch: {
      files: ['lib/*', 'vendor/*', 'test/tests/*'],
      tasks: ['build', 'concat:tests']
    },

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:9292/test/index.html'
          ]
        }
      }
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
        src: ['lib/conductor.js', 'lib/conductor/card.js'],
        dest: 'tmp/conductor.js'
      },

      tests: {
        src: 'test/tests/*.js',
        dest: 'tmp/conductor_tests.js'
      },

      dist: {
        src: ['lib/loader.js', 'vendor/rsvp.amd.js', 'vendor/oasis.amd.js', 'tmp/conductor.browser.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    }
  });

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

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

      console.log("Writing to " + f.dest);
      grunt.file.write(f.dest, contents);
    });
  });


};

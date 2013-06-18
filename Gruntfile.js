module.exports = function(grunt) {
  var Globule = require('globule'),
      File = require('fs'),
      Path = require('path'),
      exec = require('child_process').exec;

  // Alias tasks for the most common sets of tasks.
  // Most of the time, you will use these.

  // By default, (i.e., if you invoke `grunt` without arguments), do
  // a new build.
  this.registerTask('default', ['build']);

  // Build a new version of the library
  this.registerTask('build', "Builds a distributable version of Conductor.js",
                    ['clean', 'jshint', 'concat:conductor', 'transpile', 'concat:dist', 'copy', 'jsframe:conductor']);

  // Build a dev version of the library
  this.registerTask('build-dev', "Builds a development version of Conductor.js",
                    ['clean', 'concat:conductor', 'transpile', 'concat:dist', 'copy', 'jsframe:conductor']);

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

  this.registerMultiTask('jsframe', 'build polyglot files', function () {
    var jsf = require('jsframe'),
        dest = this.data.dest,
        src = this.data.src;

    src.forEach( function(pattern) {
      var files = Globule.find(pattern);
      files.forEach( function(filePath) {
        var basename = Path.basename(filePath),
            targetName = Path.join(dest, basename) + '.html',
            outFd = File.openSync(targetName, 'w');

        console.log(filePath + " → " + targetName);
        jsf.process(filePath, outFd);
        File.close(outFd);
      });
    });
  });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {},

      options: {
        port: 8000,
        //hostname: 'your.host',    // hostname: '*' is broken in
                                    // grunt-contrib-connect at the moment
        base: '.'
      }
    },

    watch: {
      files: ['lib/**', 'vendor/*', 'test/tests/*', 'node_modules/jsframe/*'],
      tasks: ['build-dev', 'concat:tests']
    },

    transpile: {
      amd: {
        type: "amd",
        files: [{
          expand: true,
          cwd: 'tmp/',
          src: ['conductor.js'],
          dest: 'tmp/amd'
        }]
      },

      globals: {
        type: "globals",
        imports: {oasis: 'Oasis'},
        files: [{
          expand: true,
          cwd: 'tmp/',
          src: ['conductor.js'],
          dest: 'tmp/browser'
        }]
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
        src: ['lib/loader.js', 'vendor/uuid.core.js', 'vendor/kamino.js', 'vendor/message_channel.js', 'vendor/rsvp.amd.js', 'vendor/oasis.amd.js', 'lib/exporter.js', 'tmp/browser/conductor.js'],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    copy: {
      amd: {
        files: [
          {src: ['tmp/amd/conductor.js'], dest: 'dist/conductor.amd.js'}
        ]
      }
    },

    jsframe: {
      conductor: {
        src: ['dist/<%= pkg.name %>-<%= pkg.version %>.js'],
        dest: 'dist'
      }
    },

    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      all: ['Gruntfile.js', 'lib/**/*.js', 'test/tests/**/*.js']
    },

    'saucelabs-qunit': {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/index.html'
          ],
          tunnelTimeout: 5,
          /*global process */
          build: process.env.TRAVIS_BUILD_NUMBER,
          concurrency: 3,
          browsers: [{
            browserName: 'chrome',
            version: '27',
            platform: 'Windows 8'
          },{
            browserName: 'internet explorer',
            version: '10',
            platform: 'Windows 8'
          }, {
            browserName: 'internet explorer',
            version: '9',
            platform: 'Windows 7'
          },{
            browserName: 'firefox',
            version: '21',
            platform: 'Windows 8'
          },{
            browserName: 'safari',
            version: '6',
            platform: 'OS X 10.8'
          }],
          testname: "Conductor.js qunit tests",
          testTimeout: 60 * 1000,
          testInterval: 5000
        }
      },

      ie: {
        options: {
          urls: [
            'http://localhost:8000/test/index.html'
          ],
          tunnelTimeout: 5,
          /*global process */
          build: process.env.TRAVIS_BUILD_NUMBER,
          concurrency: 3,
          browsers: [{
            browserName: 'internet explorer',
            version: '10',
            platform: 'Windows 8'
          }, {
            browserName: 'internet explorer',
            version: '9',
            platform: 'Windows 7'
          }],
          testname: "Conductor.js qunit tests (ie only)",
          testTimeout: 60 * 1000,
          testInterval: 5000
        }
      }
    }
  });

  // Load tasks from npm
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.registerTask('test', "Run full test suite", ['build-dev', 'concat:tests', 'connect', 'saucelabs-qunit']);
  grunt.registerTask('test:ie', "Run tests suite in IE", ['build-dev', 'concat:tests', 'connect', 'saucelabs-qunit:ie']);
};

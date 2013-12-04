// This is pretty terrible, but I don't know a good way to use `bower ls` here.
// There are two issues
//  1.  UUID doesn't have a bower.json so we have to know a-priori the path to
//      its main file
//  2.  `bower.commands.list` is async; I don't know a good way to get output
//      from async commands into a grunt config.
//      see https://github.com/gruntjs/grunt/issues/783
var vendorSources = require('grunt').file.readJSON('vendorSources.json');

module.exports = {
  amd: {
    src: ['tmp/amd/**/*.js', '!tmp/amd/conductor/dev.js'],
    dest: 'dist/conductor-<%= pkg.version %>.amd.js'
  },

  amdDev: {
    src: ['dist/conductor-<%= pkg.version %>.amd.js', 'tmp/amd/conductor/dev.js'],
    dest: 'dist/conductor-<%= pkg.version %>-dev.amd.js'
  },

  browser: {
    src: vendorSources.concat([
      'dist/conductor-<%= pkg.version %>.amd.js'
    ]),
    dest: 'dist/conductor-<%= pkg.version %>.js',
    options: {
      footer: "self.Oasis = requireModule('oasis'); self.Conductor = requireModule('conductor'); requireModule('conductor/card'); self.oasis = new self.Oasis(); self.oasis.autoInitializeSandbox();"
    }
  },

  browserDev: {
    src: vendorSources.concat([
      'dist/conductor-<%= pkg.version %>-dev.amd.js'
    ]),
    dest: 'dist/conductor-<%= pkg.version %>-dev.js',
    options: {
      footer: "requireModule('conductor/dev'); self.Oasis = requireModule('oasis'); self.Conductor = requireModule('conductor'); requireModule('conductor/card'); self.oasis = new self.Oasis(); self.oasis.autoInitializeSandbox();"
    }
  },

  tests: {
    src: ['test/helpers/*', 'test/tests/**/*.js'],
    dest: 'tmp/public/conductor_tests.js'
  }
};

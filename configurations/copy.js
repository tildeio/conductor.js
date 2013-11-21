var vendorSources = require('grunt').file.readJSON('vendorSources.json');

module.exports = {
  lib: {
    files: [{
      cwd: 'lib/',
      src: ['**/*.js', '!conductor.js'],
      dest: 'tmp/lib/conductor/',
      expand: true,
      flatten: true
    }, {
      cwd: 'lib/',
      src: ['conductor.js'],
      dest: 'tmp/lib/',
      expand: true
    }]
  },

  // overwrite tmp/lib with converted lineendings to work around transpiler
  // 0.2.x issue
  LFlib: {
    files: [{
      cwd: 'tmp/libLF',
      src: ['**/*'],
      dest: 'tmp/lib/',
      expand: true,
    }]
  },

  CRLFamd: {
    files: [{
      cwd: 'tmp/amdCRLF',
      src: ['**/*'],
      dest: 'tmp/amd/',
      expand: true,
    }]
  },

  LFjsframe: {
    files: [{
      cwd: 'tmp/browserLF',
      src: ['**/*'],
      dest: 'tmp/browser',
      expand: true,
    }]
  },

  CRLFjsframe: {
    files: [{
      cwd: 'tmp/distCRLF',
      src: ['**/*'],
      dest: 'dist/',
      expand: true,
    }]
  },

  tests: {
    files: [{
      cwd: 'dist/',
      src: ['conductor-<%= pkg.version %>-dev.js.html'],
      dest: 'tmp/public/',
      expand: true
    }, {
      cwd: 'test/',
      src: [ 'lib/*', 'index.html'].concat(vendorSources).concat(['vendor/*' ]),
      dest: 'tmp/public/',
      expand: true
    }, {
      src: [ 'test/fixtures/**' ],
      dest: 'tmp/public/',
      expand: true
    }]
  },

  testsVendor: {
    expand: true,
    cwd: 'bower_components',
    src: [
      'qunit/qunit/*',
      'jquery/jquery.js'
    ],
    flatten: true,
    dest: 'tmp/public/vendor/'
  }
};

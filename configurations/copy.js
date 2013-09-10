module.exports = {
  lib: {
    files: [{
      cwd: 'lib/consumers/',
      src: [ '*.js' ],
      dest: 'tmp/lib/conductor/',
      expand: true
    }, {
      cwd: 'lib/services/',
      src: [ '*.js' ],
      dest: 'tmp/lib/conductor/',
      expand: true
    }, {
      cwd: 'lib/conductor/',
      src: [ '*.js' ],
      dest: 'tmp/lib/conductor/',
      expand: true
    }, {
      cwd: 'lib/utils/',
      src: [ '*.js' ],
      dest: 'tmp/lib/conductor/',
      expand: true
    }, {
      cwd: 'lib/',
      src: ['services.js', 'shims.js'],
      dest: 'tmp/lib/conductor/',
      expand: true
    }, {
      cwd: 'lib/',
      src: ['conductor.js'],
      dest: 'tmp/lib/',
      expand: true
    }]
  },

  tests: {
    files: [{
      cwd: 'dist/',
      src: ['<%= pkg.name %>-<%= pkg.version %>.js.html'],
      dest: 'tmp/public/',
      expand: true
    }, {
      cwd: 'test/',
      src: [ 'lib/*', 'index.html', 'vendor/*' ],
      dest: 'tmp/public/',
      expand: true
    }, {
      src: [ 'test/fixtures/**' ],
      dest: 'tmp/public/',
      expand: true
    }]
  }
};

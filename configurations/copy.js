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
  }
};

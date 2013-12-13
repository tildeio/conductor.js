// This task should only be run on windows: 0.2.x of the module transpiler
module.exports = {
  lib: {
    options: {
      eol: 'lf'
    },
    files: [{
      expand: true,
      cwd: 'tmp/lib/',
      src: ['**/*.js'],
      dest: 'tmp/libLF'
    }]
  },

  amd: {
    options: {
      eol: 'crlf'
    },
    files: [{
      expand: true,
      cwd: 'tmp/amd/',
      src: ['**/*.js'],
      dest: 'tmp/amdCRLF'
    }]
  },
};

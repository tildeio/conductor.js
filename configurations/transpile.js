module.exports = {
  amd: {
    type: "amd",
    files: [{
      expand: true,
      cwd: 'tmp/lib/',
      src: ['**/*.js'],
      dest: 'tmp/amd'
    }]
  }
};

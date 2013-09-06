module.exports = {
  files: ['lib/**/*.js', 'vendor/*', 'test/tests/*', 'test/helpers/*', 'test/fixtures/*', 'node_modules/jsframe/*'],
  tasks: ['build', 'concat:tests']
};

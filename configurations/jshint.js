module.exports = {
  options: {
    jshintrc: './.jshintrc',
    force: true
  },
  all: [
    'Gruntfile.js',
    'lib/**/*.js',
    'test/tests/**/*.js',
    // There's one warning that we can't disable in here, grabbed from a
    // Mozilla polyfill.  Don't want to change `!=` to `!==` in a polyfill.
    '!lib/shims.js'
  ]
};

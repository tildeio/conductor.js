module.exports = {
  amd: {
    src: ['tmp/amd/**/*.js'],
    dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js'
  },

  browser: {
    src: [
      'vendor/loader.js',
      'node_modules/rsvp/dist/*.amd.js',
      'vendor/**/*.js',
      'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js'
    ],
    dest: 'tmp/browser/<%= pkg.name %>-<%= pkg.version %>.js',
    options: {
      footer: "self.Oasis = requireModule('oasis'); self.Conductor = requireModule('conductor'); requireModule('conductor/card'); self.oasis = new self.Oasis(); self.oasis.autoInitializeSandbox();"
    }
  },

  tests: {
    src: ['test/helpers/*', 'test/tests/**/*_test.js'],
    dest: 'tmp/conductor_tests.js'
  }
};

var port = parseInt(process.env.PORT || 8000, 10);

module.exports = {
  options: {
    hostname: '*',
    base: 'tmp/public'
  },

  server: {
    options: {
      port: port
    }
  },

  otherDomain: {
    options: {
      port: port + 1,
    }
  }
};

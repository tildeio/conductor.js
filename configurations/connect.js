var port = parseInt(process.env.PORT || 8000, 10);

module.exports = {
  options: {
    hostname: '*',
    base: '.'
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

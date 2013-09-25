/*global process */
var port = parseInt(process.env.PORT || 8000, 10);
var lockFile = require('lockfile');

// works with tasks/locking.js
function lock(req, res, next) {
  (function retry() {
    if (lockFile.checkSync('tmp/connect.lock')) {
      setTimeout(retry, 100);
    } else {
      next();
    }
  }());
}

function cors(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader("Access-Control-Allow-Headers", 'accepts, origin');
  next();
}

function optionsMethod(req, res, next) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
  } else {
    next();
  }
}

function middleware(connect, options) {
  return [
    lock,
    cors,
    optionsMethod,
    connect['static'](options.base),
    connect.directory(options.base)
  ];
}

module.exports = {
  options: {
    base: 'tmp/public',
    hostname: '*',
    middleware: middleware
  },

  server: {
    options: {
      port: port,
    }
  },

  crossOriginServer: {
    options: {
      port: port + 1,
    }
  },

  playground: {
    options: {
      base: '',
      port: port + 2,
    }
  }
};

var ieBrowsers = [{
      browserName: 'internet explorer',
      version: '10',
      platform: 'Windows 8'
    }, {
      browserName: 'internet explorer',
      version: '9',
      platform: 'Windows 7'
    }, {
      browserName: 'internet explorer',
      version: '8',
      platform: 'Windows XP'
    }],
    browsers = [{
      browserName: 'chrome',
      version: '27',
      platform: 'Windows 8'
    },{
      browserName: 'firefox',
      version: '21',
      platform: 'Windows 8'
    },{
      browserName: 'safari',
      version: '6',
      platform: 'OS X 10.8'
    }].concat( ieBrowsers );

module.exports = {
  options: {
    urls: [
      'http://localhost:8000'
    ],
    tunnelTimeout: 5,
    /*global process */
    build: process.env.TRAVIS_BUILD_NUMBER,
    concurrency: 3,
    testTimeout: 3 * 60 * 1000,
    testInterval: 5000
  },

  all: {
    options: {
      browsers: browsers,
      testname: "Conductor.js qunit tests"
    }
  },

  ie: {
    options: {
      browsers: ieBrowsers,
      testname: "Conductor.js qunit tests (ie only)"
    }
  }
};

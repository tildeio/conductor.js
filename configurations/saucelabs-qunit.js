var exec = require('shelljs').exec;
var testTimeout = 3 * 60 * 1000,
    gitLabel = exec('git name-rev `git rev-parse HEAD`').output,
    /*global process */
    travisBuildNumber = process.env.TRAVIS_BUILD_NUMBER || '',
    buildLabel = travisBuildNumber + " (" + gitLabel + ")";

module.exports = {
  options: {
    urls: [
      'http://localhost:8000'
    ],
    tunnelTimeout: testTimeout + (1 * 60 * 1000),
    build: buildLabel,
    concurrency: 3,
    testTimeout: testTimeout,
    testInterval: 5000
  },

  chrome: {
    options: {
      testname: 'Conductor.js Chrome tests',
      browsers: [{
        browserName: 'chrome',
        version: '27',
        platform: 'Windows 8'
      }]
    }
  },

  safari: {
    options: {
      testname: 'Conductor.js Safari tests',
      browsers: [{
        browserName: 'safari',
        version: '6',
        platform: 'OS X 10.8'
      }]
    }
  },

  ie: {
    options: {
      testname: 'Conductor.js IE tests',
      browsers: [{
        browserName: 'internet explorer',
        version: '10',
        platform: 'Windows 8'
      }, {
        browserName: 'internet explorer',
        version: '8',
        platform: 'Windows XP'
      }]
    }
  },

  firefox: {
    options: {
      testname: 'Conductor.js Firefox tests',
      browsers: [{
        browserName: 'firefox',
        version: '21',
        platform: 'Windows 8'
      }]
    }
  }
};

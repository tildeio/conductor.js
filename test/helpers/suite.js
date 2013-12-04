function async(callback, binding) {
  stop();

  return function() {
    start();
    return callback.apply(binding, arguments);
  };
}

function within(actual, expectedMin, expectedMax, message) {
  ok(actual >= expectedMin, message);
  ok(actual <= expectedMax, message);
}

var crossOrigin = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 1),
    addOrigin = function(url) {
      if(!url.match(/^http/)) {
        if(url[0] !== '/') {
          url = '/' + url;
        }

        url = crossOrigin + url;
      }

      return url;
    };

function newConductor( options ) {
  var conductor;

  options = options || {};
  options.testing = true;
  conductor = new Conductor( options );
  conductor.oasis.logger.enable();

  var originalLoad = conductor.load,
      originalLoadData = conductor.loadData;

  conductor.load = function() {
    arguments[0] = addOrigin(arguments[0]);

    return originalLoad.apply(conductor, arguments);
  };

  conductor.loadData = function() {
    arguments[0] = addOrigin(arguments[0]);

    return originalLoadData.apply(conductor, arguments);
  };

  return conductor;
}

function isSandboxAttributeSupported() {
  if( typeof Window === "undefined" ) return false;

  var iframe = document.createElement('iframe');

  return iframe.sandbox !== undefined;
}


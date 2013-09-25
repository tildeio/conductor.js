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

var crossOrigin = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 1);

function newConductor( options ) {
  var conductor;

  options = options || {};
  options.testing = true;
  if( !options.conductorURL ) {
    options.conductorURL = crossOrigin + '/conductor-' + Conductor.Version + '.js.html';
  }

  conductor = new Conductor( options );
  conductor.oasis.logger.enable();

  return conductor;
}

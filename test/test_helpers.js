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

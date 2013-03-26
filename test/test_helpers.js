function async(callback, binding) {
  stop();

  return function() {
    start();
    return callback.apply(binding, arguments);
  }
}

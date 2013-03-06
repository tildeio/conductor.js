Conductor.renderConsumer = function(options, promise) {
  options.events.render = function() {
    promise.resolve([].slice.call(arguments));
  };

  return Conductor.Oasis.Consumer.extend(options);
};

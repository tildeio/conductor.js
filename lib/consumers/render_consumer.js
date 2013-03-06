Conductor.renderConsumer = function(options, promise) {
  options.events.render = function(args) {
    promise.resolve(args);
  };

  return Conductor.Oasis.Consumer.extend(options);
};

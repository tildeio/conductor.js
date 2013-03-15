Conductor.renderConsumer = function(options, promise) {
  options.events.render = function(args) {
    options.render.apply(options, args);
  };

  return Conductor.Oasis.Consumer.extend(options);
};

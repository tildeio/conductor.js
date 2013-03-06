Conductor.metadataConsumer = function(options, promise) {
  options.events.data = function(data) {
    promise.resolve(data);
  };
  return Conductor.Oasis.Consumer.extend(options);
};

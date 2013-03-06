Conductor.metadataConsumer = function(promise) {
  return Conductor.Oasis.Consumer.extend({
    events: {
      data: function(data) {
        promise.resolve(data);
      }
    }
  });
};

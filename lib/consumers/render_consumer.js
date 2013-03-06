Conductor.renderConsumer = function(promise) {
  return Conductor.Oasis.Consumer.extend({
    events: {
      render: function() {
        promise.resolve([].slice.call(arguments));
      }
    }
  });
};

Conductor.dataConsumer = function(promise, card) {
  return Conductor.Oasis.Consumer.extend({
    events: {
      initializeData: function(data) {
        promise.resolve(data);
      },

      updateData: function(data) {
        card.updateData(data.bucket, data.data);
      }
    }
  });
};

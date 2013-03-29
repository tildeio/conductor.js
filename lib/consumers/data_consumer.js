Conductor.dataConsumer = function(promise, card) {
  return Conductor.Oasis.Consumer.extend({
    events: {
      initializeData: function(data) {
        card.data = data;
        promise.resolve(data);
      },

      updateData: function(data) {
        if (data.bucket === '*') {
          card.data = data.data;
        } else {
          card.data[data.bucket] = data.data;
        }

        if (card.didUpdateData) {
          card.didUpdateData(data.bucket, data.data);
        }
      }
    }
  });
};
Conductor.dataConsumer = function(promise) {
  return Conductor.Oasis.Consumer.extend({
    events: {
      initializeData: function(data) {
        this.card.data = data;
        promise.resolve(data);
      },

      updateData: function(data) {
        if (data.bucket === '*') {
          this.card.data = data.data;
        } else {
          this.card.data[data.bucket] = data.data;
        }

        if (this.card.didUpdateData) {
          this.card.didUpdateData(data.bucket, data.data);
        }
      }
    }
  });
};

Conductor.card({
  render: function() { },
  metadata: {
    document: function(promise) {
      promise.resolve({
        title: "Rails is omakase"
      });
    },

    image: function(promise) {
      promise.resolve({
        width: 100,
        height: 100
      });
    }
  }
});

Conductor.card({
  render: function() {
    document.body.innerText = "This is the metadata card. There are many like it, but this one is mine.";
  },

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

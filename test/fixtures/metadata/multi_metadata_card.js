Conductor.card({
  metadata: {
    document: function(resolver) {
      resolver.resolve({
        title: "Rails is omakase"
      });
    },

    image: function(resolver) {
      resolver.resolve({
        width: 100,
        height: 100
      });
    }
  }
});

Conductor.card({
  requests: {
    metadataFor: function(resolver, name) {
      if (name === 'title') {
        resolver.resolve("Rails is omakase");
      }
    }
  }
});

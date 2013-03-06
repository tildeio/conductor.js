var assertionPort;

Conductor.Oasis.connect('assertion', function(port) {
  assertionPort = port;
});

Conductor.card({
  requests: {
    metadataFor: function(resolver, name) {
      if (name === 'title') {
        resolver.resolve("Rails is omakase");
      }
    }
  }
});

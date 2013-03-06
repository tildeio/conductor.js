var assertionPort;

Conductor.Oasis.connect('assertion', function(port) {
  assertionPort = port;
});

Conductor.Oasis.connect('metadata').then(function(port) {
  port.onRequest('metadataFor', function(resolver, name) {
    if (name === 'title') {
      resolver.resolve("Rails is omakase");
    }
  });
});

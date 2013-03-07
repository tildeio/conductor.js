Conductor.MetadataService = Conductor.Oasis.Service.extend({
  initialize: function(port) {
    this.sandbox.metadataPort = port;
  }
});

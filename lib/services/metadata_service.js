Conductor.MetadataService = Conductor.Oasis.Service.extend({
  initialize: function(port) {
    var data = this.sandbox.data;
    this.send('data', data);

    this.sandbox.metadataPort = port;
  }
});

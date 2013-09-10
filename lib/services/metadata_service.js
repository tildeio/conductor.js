import Oasis from "oasis";

var MetadataService = Oasis.Service.extend({
  initialize: function(port) {
    this.sandbox.metadataPort = port;
  }
});

export default MetadataService;

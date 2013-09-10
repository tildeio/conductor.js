import Oasis from "oasis";

var NestedWiretappingService = Oasis.Service.extend({
  initialize: function (port) {
    this.sandbox.nestedWiretappingPort = port;
  }
});

export default NestedWiretappingService;

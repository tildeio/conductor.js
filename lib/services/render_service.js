import Oasis from "oasis";

var RenderService = Oasis.Service.extend({
  initialize: function(port) {
    this.sandbox.renderPort = port;
  }
});

export default RenderService;

Conductor.RenderService = Conductor.Oasis.Service.extend({
  initialize: function(port) {
    this.sandbox.renderPort = port;
  }
});

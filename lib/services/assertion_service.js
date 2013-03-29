Conductor.AssertionService = Conductor.Oasis.Service.extend({
  initialize: function(port) {
    this.sandbox.assertionPort = port;
  },

  events: {
    ok: function(data) {
      ok(data.bool, data.message);
    },

    start: function() {
      start();
    }
  }
});

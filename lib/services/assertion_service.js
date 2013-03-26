Conductor.AssertionService = Conductor.Oasis.Service.extend({
  events: {
    ok: function(data) {
      ok(data.bool, data.message);
    },

    start: function() {
      start();
    }
  }
});

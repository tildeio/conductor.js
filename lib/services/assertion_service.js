Conductor.AssertionService = Conductor.Oasis.Service.extend({
  events: {
    ok: function(data) {
      start();
      ok(data.bool, data.message);
    }
  }
});

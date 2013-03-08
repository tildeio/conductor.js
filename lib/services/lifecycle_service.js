Conductor.LifecycleService = Conductor.Oasis.Service.extend({
  events: {
    activated: function() {
      this.sandbox.activatePromise.resolve();
    }
  }
});

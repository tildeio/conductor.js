import Oasis from "oasis";

var LifecycleService = Oasis.Service.extend({
  events: {
    activated: function() {
      this.sandbox.activateDefered.resolve();
    }
  }
});

export default LifecycleService;

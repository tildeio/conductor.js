var card = Conductor.card({
  consumers: {
    fulfilledCapability: Conductor.Oasis.Consumer.extend({
      initialize: function () {
        start();
        ok(true, "Consumer's `initialize` was invoked for fulfilled capability");
      },
      error: function () {
        start();
        ok(false, "Consumer's `error` was not invoked for fulfilled capability");
      }
    }),
    unfulfilledCapability: Conductor.Oasis.Consumer.extend({
      initialize: function () {
        start();
        ok(false, "Consumer's `initialize` was not invoked for unfulfilled capability");
      },

      error: function () {
        start();
        ok(true, "Consumer's `error` was invoked for unfulfilled capability");
      }
    })
  }
});

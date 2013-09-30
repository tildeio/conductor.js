Conductor.card({
  consumers: {
    myDefaultCapability: Conductor.Oasis.Consumer.extend({
      initialize: function () {
        ok('Default capability initialized!');
        start();
      }
    })
  }
});

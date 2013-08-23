var dataConsumer = Conductor.Oasis.Consumer.extend({
  events: {
    initializeData: function(data) {
      this.card.deferred.data.resolve(data);
    }
  }
});

var card = Conductor.card({
  consumers: {
    data: dataConsumer
  }
});

card.waitForActivation().then( function() {
  ok(true, "The card is activated");
  start();
});

Conductor.LifecycleConsumer = Conductor.Oasis.Consumer.extend({
  initialize: function() {
    var consumer = this;

    this.card.waitForActivation().then(function() {
      consumer.send('activated');
    });
  }
});

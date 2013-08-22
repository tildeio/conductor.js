Conductor.LifecycleConsumer = Conductor.Oasis.Consumer.extend({
  initialize: function() {
    var consumer = this;

    this.card.activatePromise.then(function() {
      consumer.send('activated');
    });
  }
});

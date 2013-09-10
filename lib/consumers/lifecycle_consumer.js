import Oasis from "oasis";

var LifecycleConsumer = Oasis.Consumer.extend({
  initialize: function() {
    var consumer = this;

    this.card.waitForActivation().then(function() {
      consumer.send('activated');
    });
  }
});

export default LifecycleConsumer;

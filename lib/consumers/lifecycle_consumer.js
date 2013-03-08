Conductor.lifecycleConsumer = function(promise) {
  return Conductor.Oasis.Consumer.extend({
    initialize: function() {
      var consumer = this;

      promise.then(function() {
        consumer.send('activated');  
      });
    }
  });
};

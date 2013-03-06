Conductor.assertionConsumer = function() {
  return Conductor.Oasis.Consumer.extend({
    initialize: function() {
      var service = this;

      window.ok = function(bool, message) {
        service.send('ok', { bool: bool, message: message });
      };
    }
  });
};


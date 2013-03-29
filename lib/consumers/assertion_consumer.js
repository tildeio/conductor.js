Conductor.assertionConsumer = function(promise, card) {
  return Conductor.Oasis.Consumer.extend({
    initialize: function() {
      var service = this;

      window.ok = function(bool, message) {
        service.send('ok', { bool: bool, message: message });
      };

      window.start = function() {
        service.send('start');
      };

      promise.resolve();
    },

    events: {
      instruct: function(info) {
        card.instruct(info);
      }
    }
  });
};
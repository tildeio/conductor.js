Conductor.card({
  consumers: {
    custom: Conductor.Oasis.Consumer.extend({
      initialize: function (port) {
        this.card.acknowledge( port );
      }
    })
  },

  acknowledge: function(port) {
    port.send('result', 'success');
  }
});

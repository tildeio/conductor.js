Conductor.card({
  consumers: {
    custom: function () {
      return Conductor.Oasis.Consumer.extend({
        initialize: function (port) {
          port.send('result', 'success');
        }
      });
    }
  }
});

var destinationUrl = location.protocol + "//" + location.hostname + ":" + (parseInt( location.port, 10) + 2);

Conductor.card({
  conductorConfiguration: {
    conductorURL: destinationUrl + '/conductor-0.3.0.js.html',
    allowSameOrigin: true
  },
  childCards: [
    {url: '/test/fixtures/child/config_conductor_child_card.js', id: 1, options: {capabilities: ['assertion']}, data: 'food for card'}
  ],

  activate: function() {
    ok(true, "parent card activated");
  }
});

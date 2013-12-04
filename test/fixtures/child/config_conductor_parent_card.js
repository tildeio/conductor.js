var destinationUrl = location.protocol + "//" + location.hostname + ":" + (parseInt( location.port, 10) + 2);

Conductor.card({
  conductorConfiguration: {
    allowSameOrigin: true
  },
  childCards: [
    {url: destinationUrl + '/test/fixtures/child/config_conductor_child_card.html', id: 1, options: {capabilities: ['assertion']}, data: 'food for card'}
  ],

  activate: function() {
    ok(true, "parent card activated");
  }
});

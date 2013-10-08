var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);

Conductor.card({
  conductorConfiguration: {
    conductorURL: destinationUrl + "/conductor-0.3.0.js.html"
  },
  childCards: [
    {url: '/test/fixtures/child/no_service_card.js', id: 1, options: {capabilities: ['assertion']}}
  ],
  loadDataForChildCards: function(data) {
    equal( data, "food for cards", "");
  },
  activate: function() {
    ok(true, "parent card activated");
  }
});

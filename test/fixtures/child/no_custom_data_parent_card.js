var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);

Conductor.card({
  childCards: [{
    url: destinationUrl + '/test/fixtures/child/no_service_card.html',
    id: 1,
    options: {capabilities: ['assertion']}
  }],
  activate: function() {
    ok(true, "parent card activated");
    equal( this.loadDataForChildCards, undefined, "No custom data for child cards");
  }
});

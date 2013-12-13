var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);

Conductor.card({
  childCards: [{
    url: destinationUrl + '/test/fixtures/child/require_child_card.html',
    id: 1,
    options: {capabilities: ['assertion']}
  }]
});

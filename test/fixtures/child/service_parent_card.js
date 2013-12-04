var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);
var CustomService = Conductor.Oasis.Service.extend({
  events: {
    result: function (result) {
      start();
      equal(result,"success", "Custom Service received message");
    }
  }
});

Conductor.card({
  childCards: [{
    url: destinationUrl + '/test/fixtures/custom_consumer_card.html',
    id: 1,
    options: {capabilities: ['custom']}
  }],
  services: {
    custom: CustomService
  }
});

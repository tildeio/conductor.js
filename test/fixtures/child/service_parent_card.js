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
  conductorConfiguration: {
    conductorURL: destinationUrl + "/conductor-0.3.0.js.html"
  },
  childCards: [
    {url: '/test/fixtures/custom_consumer_card.js', id: 1, options: {capabilities: ['custom']}}
  ],
  services: {
    custom: CustomService
  }
});

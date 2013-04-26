var CustomService = Conductor.Oasis.Service.extend({
  events: {
    result: function (result) {
      start();
      equal(result,"success", "Custom Service received message");
    }
  }
});

Conductor.card({
  childCards: [
    {url: '/test/fixtures/custom_consumer_card.js', id: 1, options: {capabilities: ['custom']}}
  ],
  services: {
    custom: CustomService
  }
});

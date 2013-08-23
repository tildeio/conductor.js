// TODO: Update test environment to not depend on this for older browsers.
Conductor.Oasis.configure('allowSameOrigin', true);

Conductor.card({
  activate: function () {
    ok(true, "Card was activated");
    start();

    var conductor = new Conductor({ testing: true });
    conductor.services.assertion = Conductor.MultiplexService.extend({
      upstream: this.consumers.assertion,
      transformEvent: function (eventName, data) {
        return "transformedData";
      }
    });
    conductor.load("/test/fixtures/child/send_event_to_be_transformed_card.js").appendTo(document.body);
  }
});

Conductor.card({
  activate: function () {
    ok(true, "Card was activated");
    start();

    var conductor = new Conductor({ testing: true });
    conductor.addDefaultCapability('assertion', Conductor.MultiplexService.extend({
      upstream: this.consumers.assertion,
      transformEvent: function (eventName, data) {
        return "transformedData";
      }
    }));
    conductor.load("/test/fixtures/child/send_event_to_be_transformed_card.js").appendTo(document.body);
  }
});

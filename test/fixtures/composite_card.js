Conductor.require("alert.js");

Conductor.card({
  activate: function () {
    ok(true, "Card was activated");
    start();

    var conductor = new Conductor({ testing: true });

    conductor.services.xhr = Conductor.MultiplexService.extend({ upstream: this.consumers.xhr });
    conductor.load("/test/fixtures/load_card.js").appendTo(document.body);
    conductor.load("/test/fixtures/load_card.js").appendTo(document.body);
  }
});

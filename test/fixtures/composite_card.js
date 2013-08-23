Conductor.require("alert.js");

// TODO: Update test environment to not depend on this for older browsers.
Conductor.Oasis.configure('allowSameOrigin', true);

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

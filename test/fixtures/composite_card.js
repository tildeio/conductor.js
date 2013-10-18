Conductor.require("alert.js");

Conductor.card({
  activate: function () {
    ok(true, "Card was activated");
    start();

    var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);
    var conductor = new Conductor({
      testing: true,
      conductorURL: destinationUrl + '/conductor-0.3.0.js.html'
    });

    conductor.addDefaultCapability('xhr', Conductor.MultiplexService.extend({ upstream: this.consumers.xhr }));
    conductor.load("/test/fixtures/load_card.js").appendTo(document.body);
    conductor.load("/test/fixtures/load_card.js").appendTo(document.body);
  }
});

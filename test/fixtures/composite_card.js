Conductor.require("alert.js");

Conductor.card({
  activate: function () {
    ok(true, "Card was activated");
    start();

    var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);
    var conductor = new Conductor({
      testing: true
    });

    conductor.addDefaultCapability('xhr', Conductor.MultiplexService.extend({ upstream: this.consumers.xhr }));
    conductor.load(destinationUrl + "/test/fixtures/load_card.html").appendTo(document.body);
    conductor.load(destinationUrl + "/test/fixtures/load_card.html").appendTo(document.body);
  }
});

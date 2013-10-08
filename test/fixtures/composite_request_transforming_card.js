Conductor.card({
  activate: function () {
    ok(true, "Card was activated");
    start();

    var destinationUrl = window.location.protocol + "//" + window.location.hostname + ":" + (parseInt(window.location.port, 10) + 2);
    var conductor = new Conductor({
      testing: true,
      conductorURL: destinationUrl + '/conductor-0.3.0.js.html'
    });

    conductor.addDefaultCapability('xhr', Conductor.MultiplexService.extend({
      upstream: this.consumers.xhr,
      transformRequest: function (requestEvent, data) {
        data.args[0] = "alert2.js";
        return data;
      }
    }));
    conductor.load("/test/fixtures/load_card.js").appendTo(document.body);
  }
});

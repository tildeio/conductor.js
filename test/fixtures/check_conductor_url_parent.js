oasis.logger.enable();

Conductor.card({
  consumers: { urlChecker: Conductor.Oasis.Consumer },
  activate: function () {
    var conductor = new Conductor({ testing: true });

    // TODO: Update test environment to not depend on this for older browsers.
    conductor.oasis.configure('allowSameOrigin', true);

    conductor.services.urlChecker = Conductor.MultiplexService.extend({
      upstream: this.consumers.urlChecker
    });
    conductor.load(
      "/test/fixtures/check_conductor_url.js",
      1,
      { capabilities: ['urlChecker'] }
    ).appendTo(document.body);
  }
});

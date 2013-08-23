Conductor.Oasis.logger.enable();
// TODO: Update test environment to not depend on this for older browsers.
Conductor.Oasis.configure('allowSameOrigin', true);

Conductor.card({
  consumers: { urlChecker: Conductor.Oasis.Consumer },
  activate: function () {
    var conductor = new Conductor({ testing: true });
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

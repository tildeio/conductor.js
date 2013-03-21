(function(globals) {
  var Conductor = globals.Conductor = function(options) {
    this.options = options || {};
  };

  Conductor.Oasis = requireModule('oasis');

  var requiredUrls = [],
      requiredCSSUrls = [],
      RSVP = Conductor.Oasis.RSVP,
      Promise = RSVP.Promise;

  Conductor.prototype = {
    load: function(url, data) {
      var capabilities = ['xhr', 'metadata', 'render', 'data', 'lifecycle'];

      if (this.options.testing) {
        capabilities.push('assertion');
      }

      var sandbox = Conductor.Oasis.createSandbox({
        url: url,
        capabilities: capabilities,
        oasisURL: '/dist/conductor.js-0.1.0.js',
        services: {
          xhr: Conductor.XHRService,
          metadata: Conductor.MetadataService,
          assertion: Conductor.AssertionService,
          render: Conductor.RenderService,
          lifecycle: Conductor.LifecycleService,
          data: Conductor.DataService
        }
      });

      sandbox.data = data;
      sandbox.activatePromise = new Promise();

      sandbox.start();

      return new Conductor.CardReference(sandbox);
    }
  };

})(window);

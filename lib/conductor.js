(function(globals) {
  var Conductor = globals.Conductor = function(options) {
    this.options = options || {};
  };

  Conductor.Oasis = requireModule('oasis');

  var requiredUrls = [],
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
        dependencies: ['/dist/conductor.js-0.1.0.js'],
        capabilities: capabilities,
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

  Conductor.require = function(url) {
    requiredUrls.push(url);
  };

  Conductor.card = function(options) {
    var metadataPromise = new Promise();

    metadataPromise.then(function(data) {
      options.data = data;
    });

    var renderPromise = new Promise();

    renderPromise.then(function(args) {
      options.render.apply(options, args);
    });

    var xhrPromise = new Promise();

    options.events = options.events || {};
    options.requests = options.requests || {};

    var assertionPromise = new Promise();
    var dataPromise = new Promise();

    var activatePromise = RSVP.all([ dataPromise, xhrPromise ])
      .then(function(resolutions) {
        if (options.activate) {
          options.activate(resolutions[0]);
        }
      });

    var cardOptions = {
      consumers: {
        xhr: Conductor.xhrConsumer(options, requiredUrls, xhrPromise),
        render: Conductor.renderConsumer(options, renderPromise),
        metadata: Conductor.metadataConsumer(options, metadataPromise),
        assertion: Conductor.assertionConsumer(assertionPromise),
        data: Conductor.dataConsumer(dataPromise, options),
        lifecycle: Conductor.lifecycleConsumer(activatePromise)
      }
    };

    Conductor.Oasis.connect(cardOptions);

  };

})(window);

(function(globals) {
  var requiredUrls = [],
      xhrPort;

  var Conductor = globals.Conductor = function(options) {
    this.options = options || {};
  };

  Conductor.Oasis = requireModule('oasis');

  Conductor.prototype = {
    load: function(url, data) {
      var capabilities = ['xhr', 'metadata', 'render', 'data'];

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
          data: Conductor.DataService
        }
      });

      sandbox.data = data;

      sandbox.start();

      return new Conductor.Card(sandbox);
    }
  };

  Conductor.require = function(url) {
    requiredUrls.push(url);
  };

  Conductor.card = function(options) {
    var metadataPromise = new Conductor.Oasis.RSVP.Promise();

    metadataPromise.then(function(data) {
      options.data = data;
    });

    var renderPromise = new Conductor.Oasis.RSVP.Promise();

    renderPromise.then(function(args) {
      options.render.apply(options, args);
    });

    var xhrPromise = new Conductor.Oasis.RSVP.Promise();

    options.events = options.events || {};
    options.requests = options.requests || {};

    var assertionPromise = new Conductor.Oasis.RSVP.Promise();
    var dataPromise = new Conductor.Oasis.RSVP.Promise();

    var cardOptions = {
      consumers: {
        xhr: Conductor.xhrConsumer(options, requiredUrls, xhrPromise),
        render: Conductor.renderConsumer(options, renderPromise),
        metadata: Conductor.metadataConsumer(options, metadataPromise),
        assertion: Conductor.assertionConsumer(assertionPromise),
        data: Conductor.dataConsumer(dataPromise, options)
      }
    };

    Conductor.Oasis.connect(cardOptions);

    Conductor.Oasis.RSVP.all([ dataPromise, xhrPromise, assertionPromise ]).then(function(resolutions) {
      options.activate(resolutions[0]);
    });
  };

})(window);

(function() {
  var requiredUrls = [],
      RSVP = requireModule('rsvp'),
      Promise = RSVP.Promise;

  Conductor.require = function(url) {
    requiredUrls.push(url);
  };

  Conductor.Card = function(options) {
    this.options = options = options || {};

    var metadataPromise = this.promise(function(data) {
      options.data = data;
    });

    var renderPromise = this.promise(function(args) {
      options.render.apply(options, args);
    });

    var xhrPromise = this.promise();

    options.events = options.events || {};
    options.requests = options.requests || {};

    var assertionPromise = this.promise();
    var dataPromise = this.promise();

    var activatePromise = this.activateWhen(dataPromise, [ xhrPromise, assertionPromise ]);

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

  Conductor.Card.prototype = {
    promise: function(callback) {
      var promise = new Promise();
      if (callback) { promise.then(callback); }
      return promise;
    },

    activateWhen: function(dataPromise, otherPromises) {
      var options = this.options;

      return RSVP.all([dataPromise].concat(otherPromises)).then(function(resolutions) {
        if (options.activate) { options.activate(resolutions[0]); }
      });
    }
  };

  Conductor.card = function(options) {
    return new Conductor.Card(options);
  };
})();

(function() {
  var requiredUrls = [],
      requiredCSSUrls = [],
      RSVP = requireModule('rsvp'),
      Promise = RSVP.Promise;

  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  Conductor.require = function(url) {
    requiredUrls.push(url);
  };

  Conductor.requireCSS = function(url) {
    requiredCSSUrls.push(url);
  };

  Conductor.Card = function(options) {
    for (var prop in options) {
      this[prop] = options[prop];
    }

    this.consumers = Object.create(Conductor.Oasis.consumers);
    this.options = options = options || {};

    var metadataPromise = this.promise(function(data) {
      options.data = data;
    });

    var renderPromise = this.promise();

    var xhrPromise = this.promise();

    options.events = options.events || {};
    options.requests = options.requests || {};

    var assertionPromise = this.promise();
    var dataPromise = this.promise();

    var activatePromise = this.activateWhen(dataPromise, [ xhrPromise ]);

    for (var capability in options.consumers) {
      var factory = options.consumers[capability];
      options.consumers[capability] = factory(this);
    }

    var cardOptions = {
      consumers: extend({
        xhr: Conductor.xhrConsumer(requiredUrls, requiredCSSUrls, xhrPromise, this),
        render: Conductor.renderConsumer(renderPromise, this),
        metadata: Conductor.metadataConsumer(metadataPromise, this),
        // TODO: this should be a custom consumer provided in tests
        assertion: Conductor.assertionConsumer(assertionPromise, this),
        data: Conductor.dataConsumer(dataPromise, this),
        lifecycle: Conductor.lifecycleConsumer(activatePromise)
      }, options.consumers)
    };

    Conductor.Oasis.connect(cardOptions);
  };

  Conductor.Card.prototype = {
    promise: function(callback) {
      var promise = new Promise();
      if (callback) { promise.then(callback); }
      return promise;
    },

    updateData: function(name, hash) {
      Conductor.Oasis.portFor('data').send('updateData', { bucket: name, object: hash });
    },

    activateWhen: function(dataPromise, otherPromises) {
      var card = this;

      return RSVP.all([dataPromise].concat(otherPromises)).then(function(resolutions) {
        if (card.activate) { card.activate(resolutions[0]); }
      });
    }
  };

  Conductor.card = function(options) {
    return new Conductor.Card(options);
  };
})();

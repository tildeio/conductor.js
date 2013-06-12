/*global PathUtils */

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
    var card = this;

    for (var prop in options) {
      this[prop] = options[prop];
    }

    this.consumers = Object.create(Conductor.Oasis.consumers);
    this.options = options = options || {};

    var renderPromise = this.promise();

    var xhrPromise = this.promise();

    options.events = options.events || {};
    options.requests = options.requests || {};

    var assertionPromise = this.promise();
    var dataPromise = this.promise();

    var activatePromise = this.activateWhen(dataPromise, [ xhrPromise ]);

    this.promise = new RSVP.Promise();
    activatePromise.then(function () {
      card.promise.resolve(card);
    }, Conductor.error);

    var cardOptions = {
      consumers: extend({
        xhr: Conductor.xhrConsumer(requiredUrls, requiredCSSUrls, xhrPromise, this),
        render: Conductor.renderConsumer(renderPromise, this),
        metadata: Conductor.metadataConsumer(this),
        // TODO: this should be a custom consumer provided in tests
        assertion: Conductor.assertionConsumer(assertionPromise, this),
        data: Conductor.dataConsumer(dataPromise, this),
        lifecycle: Conductor.lifecycleConsumer(activatePromise),
        height: Conductor.heightConsumer(this),
        nestedWiretapping: Conductor.nestedWiretapping(this)
      }, options.consumers)
    };

    for (var prop in cardOptions.consumers) {
      cardOptions.consumers[prop] = cardOptions.consumers[prop].extend({card: this});
    };

    Conductor.Oasis.connect(cardOptions);
  };

  Conductor.Card.prototype = {
    promise: function(callback) {
      var promise = new Promise();
      if (callback) { promise.then(callback, Conductor.error) };
      return promise;
    },

    updateData: function(name, hash) {
      Conductor.Oasis.portFor('data').send('updateData', { bucket: name, object: hash });
    },

    /**
     A card can contain other cards.

     `childCards` is an array of objects describing the differents cards. The accepted attributes are:
     * `url` {String} the url of the card
     * `id` {String} a unique identifier for this instance (per type)
     * `options` {Object} Options passed to `Conductor.load` (optional)
     * `data` {Object} passed to `Conductor.loadData`

     Example:

        Conductor.card({
          childCards: [
            { url: '../cards/survey', id: 1 , options: {}, data: '' }
          ]
        });

     Any `Conductor.Oasis.Service` needed for a child card can be simply declared with the `services` attribute
     A card can contain other cards.

     Example:

        Conductor.card({
          services: {
            survey: SurveyService
          },
          childCards: [
            {url: 'survey', id: 1 , options: {capabilities: ['survey']} }
          ]
        });

     `loadDataForChildCards` can be defined when a child card needs data passed to the parent card.

     Once `initializeChildCards` has been called, the loaded card can be accessed through the `childCards` attribute.

     Example:

        var card = Conductor.card({
          childCards: [
            { url: '../cards/survey', id: 1 , options: {}, data: '' }
          ]
        });


        // After `initializeChildCards` has been called
        var surveyCard = card.childCards[0].card;

      The easy way to add a child card to the DOM is through the `initializeDOM` hook from the `render` service.
     */
    initializeChildCards: function( data ) {
      var prop;

      if(this.childCards) {
        this.conductor = new Conductor();
        this.conductor.services.xhr = Conductor.MultiplexService.extend({
          upstream: this.consumers.xhr,
          transformRequest: function (requestEventName, data) {
            var base = this.sandbox.options.url;
            if (requestEventName === 'get') {
              data.args = data.args.map(function (resourceUrl) {
                var url = PathUtils.cardResourceUrl(base, resourceUrl);
                return PathUtils.cardResourceUrl(document.baseURI, url);
              });
            }

            return data;
          }
        });

        // A child card may not need new services
        if( this.services ) {
          for( prop in this.services) {
            this.conductor.services[prop] = this.services[prop];
          }
        }

        // Hook if you want to initialize cards that are not yet instantiated
        if( this.loadDataForChildCards ) {
          this.loadDataForChildCards( data );
        }

        for( prop in this.childCards ) {
          var childCardOptions = this.childCards[prop];

          this.conductor.loadData(
            childCardOptions.url,
            childCardOptions.id,
            childCardOptions.data
          );

          childCardOptions.card = this.conductor.load( childCardOptions.url, childCardOptions.id, childCardOptions.options );
        }
      }
    },

    activateWhen: function(dataPromise, otherPromises) {
      var card = this;

      return RSVP.all([dataPromise].concat(otherPromises)).then(function(resolutions) {
        // Need to think if this called at the right place/time
        // My assumption for the moment is that
        // we don't rely on some initializations done in activate
        if (card.initializeChildCards) { card.initializeChildCards(resolutions[0]); }

        if (card.activate) { card.activate(resolutions[0]); }
      });
    }
  };

  Conductor.card = function(options) {
    return new Conductor.Card(options);
  };
})();

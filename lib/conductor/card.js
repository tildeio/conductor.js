/*global PathUtils ConductorShims*/

(function() {
  var requiredUrls = [],
      requiredCSSUrls = [],
      RSVP = requireModule('rsvp'),
      Promise = RSVP.Promise,
      o_create = ConductorShims.o_create,
      a_forEach = ConductorShims.a_forEach,
      a_map = ConductorShims.a_map;

  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  function getBase () {
    var link = document.createElement("a");
    link.href = "!";
    var base = link.href.slice(0, -1);

    return base;
  }

  Conductor.require = function(url) {
    requiredUrls.push(url);
  };

  Conductor.requireCSS = function(url) {
    requiredCSSUrls.push(url);
  };

  Conductor.Card = function(options) {
    var card = this,
        prop;

    for (prop in options) {
      this[prop] = options[prop];
    }

    this.consumers = o_create(Conductor.Oasis.consumers);
    this.options = options = options || {};

    var renderDefered = this.defer();

    var xhrDefered = this.defer();

    options.events = options.events || {};
    options.requests = options.requests || {};

    var assertionDefered = this.defer();
    var dataDefered = this.defer();

    var activatePromise = this.activateWhen(dataDefered.promise, [ xhrDefered.promise ]);

    this.promise = activatePromise.then(function () {
      return card;
    }).then(null, Conductor.error);

    var cardOptions = {
      consumers: extend({
        xhr: Conductor.xhrConsumer(requiredUrls, requiredCSSUrls, xhrDefered, this),
        render: Conductor.renderConsumer(renderDefered, this),
        metadata: Conductor.metadataConsumer(this),
        // TODO: this should be a custom consumer provided in tests
        assertion: Conductor.assertionConsumer(assertionDefered, this),
        data: Conductor.dataConsumer(dataDefered, this),
        lifecycle: Conductor.lifecycleConsumer(activatePromise),
        height: Conductor.heightConsumer(this),
        nestedWiretapping: Conductor.nestedWiretapping(this)
      }, options.consumers)
    };

    for (prop in cardOptions.consumers) {
      cardOptions.consumers[prop] = cardOptions.consumers[prop].extend({card: this});
    }

    Conductor.Oasis.connect(cardOptions);
  };

  Conductor.Card.prototype = {
    defer: function(callback) {
      var defered = RSVP.defer();
      if (callback) { defered.promise.then(callback).then(null, Conductor.error); }
      return defered;
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

     Any `Conductor.Oasis.Service` needed for a child card can be simply
     declared with the `services` attribute.  A card can contain other cards.

     Example:

        Conductor.card({
          services: {
            survey: SurveyService
          },
          childCards: [
            {url: 'survey', id: 1 , options: {capabilities: ['survey']} }
          ]
        });

     `loadDataForChildCards` can be defined when a child card needs data passed
     to the parent card.

     Once `initializeChildCards` has been called, the loaded card can be
     accessed through the `childCards` attribute.

     Example:

        var card = Conductor.card({
          childCards: [
            { url: '../cards/survey', id: 1 , options: {}, data: '' }
          ]
        });


        // After `initializeChildCards` has been called
        var surveyCard = card.childCards[0].card;

      Child cards can be added to the DOM by overriding `initializeDOM`.  The
      default behavior of `initializeDOM` is to add all child cards to the body
      element.
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
              data.args = a_map.call(data.args, function (resourceUrl) {
                var url = PathUtils.cardResourceUrl(base, resourceUrl);
                return PathUtils.cardResourceUrl(getBase(), url);
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

    initializeDOM: function () {
      if (this.childCards) {
        a_forEach.call(this.childCards, function(cardInfo) {
          cardInfo.card.appendTo(document.body);
        });
      }
    },

    render: function () {},

    activateWhen: function(dataPromise, otherPromises) {
      var card = this;

      return RSVP.all([dataPromise].concat(otherPromises)).then(function(resolutions) {
        // Need to think if this called at the right place/time
        // My assumption for the moment is that
        // we don't rely on some initializations done in activate
        if (card.initializeChildCards) { card.initializeChildCards(resolutions[0]); }

        if (card.activate) {
          return card.activate(resolutions[0]);
        }
      });
    }
  };

  Conductor.card = function(options) {
    return new Conductor.Card(options);
  };
})();

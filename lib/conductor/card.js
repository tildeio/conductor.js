import Conductor from "conductor";
import Oasis from "oasis";
import AssertionConsumer from "conductor/assertion_consumer";
import XhrConsumer from "conductor/xhr_consumer";
import RenderConsumer from "conductor/render_consumer";
import MetadataConsumer from "conductor/metadata_consumer";
import DataConsumer from "conductor/data_consumer";
import LifecycleConsumer from "conductor/lifecycle_consumer";
import HeightConsumer from "conductor/height_consumer";
import NestedWiretapping from "conductor/nested_wiretapping_consumer";
import MultiplexService from "conductor/multiplex_service";
import OasisShims from "oasis/shims";

var RSVP = Oasis.RSVP,
    Promise = RSVP.Promise,
    o_create = OasisShims.o_create,
    a_forEach = OasisShims.a_forEach,
    a_map = OasisShims.a_map;

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

function Card(options) {
  var card = this,
      prop;

  for (prop in options) {
    this[prop] = options[prop];
  }

  this.consumers = o_create(oasis.consumers);
  this.options = options = options || {};

  this.deferred = {
    data: this.defer(),
    xhr: this.defer()
  };

  options.events = options.events || {};
  options.requests = options.requests || {};

  this.activateWhen(this.deferred.data.promise, [ this.deferred.xhr.promise ]);

  var cardOptions = {
    consumers: extend({
      // TODO: this should be a custom consumer provided in tests
      assertion: AssertionConsumer,
      xhr: XhrConsumer,
      render: RenderConsumer,
      metadata: MetadataConsumer,
      data: DataConsumer,
      lifecycle: LifecycleConsumer,
      height: HeightConsumer,
      nestedWiretapping: NestedWiretapping
    }, options.consumers)
  };

  for (prop in cardOptions.consumers) {
    cardOptions.consumers[prop] = cardOptions.consumers[prop].extend({card: this});
  }

  oasis.connect(cardOptions);
}

Card.prototype = {
  waitForActivation: function () {
    return this._waitForActivationDeferral().promise;
  },

  updateData: function(name, hash) {
    oasis.portFor('data').send('updateData', { bucket: name, object: hash });
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

    You can pass the configuration to be used with Conductor on the instance used to load
    the child cards. This will be passed to `conductor.configure`.

    Example:

      Conductor.card({
        conductorConfiguration: { allowSameOrigin: true },
        childCards: [
          { url: '../cards/survey', id: 1 , options: {}, data: '' }
        ]
      });

    If you use child cards and `allowSameOrigin`, you'll need to specify in the parent card
    a different url for Conductor.js. This will ensure that the child cards can't access
    their parent.

    Example:

      Conductor.card({
        conductorConfiguration: {
          conductorURL: "...", // specify here a link to Conductor hosted on a separate domain
          allowSameOrigin: true
        },
        childCards: [
          { url: '../cards/survey', id: 1 , options: {}, data: '' }
        ]
      });
   */
  initializeChildCards: function( data ) {
    var prop,
        conductorOptions = {};

    if(this.childCards) {
      if( this.conductorConfiguration ) {
        conductorOptions.conductorURL = this.conductorConfiguration.conductorURL;
        delete this.conductorConfiguration.conductorURL;
      }

      this.conductor = new Conductor( conductorOptions );

      if( this.conductorConfiguration ) {
        for( prop in this.conductorConfiguration ) {
          this.conductor.configure( prop, this.conductorConfiguration[prop] );
        }
      }

      this.conductor.services.xhr = MultiplexService.extend({
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

  //-----------------------------------------------------------------
  // Internal

  defer: function(callback) {
    var defered = RSVP.defer();
    if (callback) { defered.promise.then(callback).fail( RSVP.rethrow ); }
    return defered;
  },

  activateWhen: function(dataPromise, otherPromises) {
    var card = this;

    return this._waitForActivationDeferral().resolve(RSVP.all([dataPromise].concat(otherPromises)).then(function(resolutions) {
      // Need to think if this called at the right place/time
      // My assumption for the moment is that
      // we don't rely on some initializations done in activate
      if (card.initializeChildCards) { card.initializeChildCards(resolutions[0]); }

      if (card.activate) {
        return card.activate(resolutions[0]);
      }
    }));
  },

  _waitForActivationDeferral: function () {
    if (!this._activationDeferral) {
      this._activationDeferral = RSVP.defer();
      this._activationDeferral.promise.fail( RSVP.rethrow );
    }
    return this._activationDeferral;
  }
};

Conductor.card = function(options) {
  return new Card(options);
};

import Oasis from "oasis";

var o_create = ConductorShims.o_create,
    a_forEach = ConductorShims.a_forEach,
    a_indexOf = ConductorShims.a_indexOf;

var Conductor = function(options) {
  this.options = options || {};
  this.conductorURL = this.options.conductorURL ||
                      Oasis.config.oasisURL ||
                      '/dist/conductor-0.2.0.js.html';

  this.data = {};
  this.cards = {};
  this.services = o_create(Conductor.services);
  this.capabilities = Conductor.capabilities.slice();
};

Conductor.configure = function (name, value) {
  if (/(conductor|oasis)URL/.test(name)) {
    Oasis.config.oasisURL = value;
  } else if ('eventCallback' === name) {
    Oasis.configure(name, value);
  } else {
    throw new Error("Unexpected Configuration `" + name + "` = `" + value + "`");
  }
};

Conductor.error = function (error) {
  return Conductor._error(error);
};
Conductor._error = function (error) {
  if (typeof console === 'object' && console.assert && console.error) {
    // chrome does not (yet) link the URLs in `console.assert`
    console.error(error.stack);
    console.assert(false, error.message);
  }
  setTimeout( function () {
    throw error;
  }, 1);
  throw error;
};

Conductor.warn = function () {
  if (console.warn) {
    return console.warn.apply(this, arguments);
  }
};

Conductor.Oasis = Oasis;

var requiredUrls = [],
    requiredCSSUrls = [],
    RSVP = Conductor.Oasis.RSVP,
    Promise = RSVP.Promise;

function coerceId(id) {
  return id + '';
}

Conductor.prototype = {
  loadData: function(url, id, data) {
    id = coerceId(id);

    this.data[url] = this.data[url] || {};
    this.data[url][id] = data;

    var cards = this.cards[url] && this.cards[url][id];

    if (!cards) { return; }

    a_forEach.call(cards, function(card) {
      card.updateData('*', data);
    });
  },

  updateData: function(card, bucket, data) {
    var url = card.url,
        id = card.id;

    this.data[url][id][bucket] = data;

    var cards = this.cards[url][id].slice(),
        index = a_indexOf.call(cards, card);

    cards.splice(index, 1);

    a_forEach.call(cards, function(card) {
      card.updateData(bucket, data);
    });
  },

  load: function(url, id, options) {
    id = coerceId(id);

    var datas = this.data[url],
        data = datas && datas[id],
        _options = options || {},
        extraCapabilities = _options.capabilities || [],
        capabilities = this.capabilities.slice(),
        cardServices = o_create(this.services),
        prop;

    capabilities.push.apply(capabilities, extraCapabilities);

    // TODO: this should be a custom service provided in tests
    if (this.options.testing) {
      capabilities.push('assertion');
    }

    // It is possible to add services when loading the card
    if( _options.services ) {
      for( prop in _options.services) {
        cardServices[prop] = _options.services[prop];
      }
    }

    var sandbox = Conductor.Oasis.createSandbox({
      url: url,
      capabilities: capabilities,
      oasisURL: this.conductorURL,
      services: cardServices
    });

    sandbox.data = data;
    sandbox.activateDefered = RSVP.defer();
    sandbox.activatePromise = sandbox.activateDefered.promise;

    var card = new Conductor.CardReference(sandbox);

    this.cards[url] = this.cards[url] || {};
    var cards = this.cards[url][id] = this.cards[url][id] || [];
    cards.push(card);

    card.url = url;
    card.id = id;

    sandbox.conductor = this;
    sandbox.card = card;

    // TODO: it would be better to access the consumer from
    // `conductor.parentCard` after the child card refactoring is in master.
    if (Conductor.Oasis.consumers.nestedWiretapping) {
      card.wiretap(function (service, messageEvent) {
        Conductor.Oasis.consumers.nestedWiretapping.send(messageEvent.type, {
          data: messageEvent.data,
          service: service+"",
          direction: messageEvent.direction,
          url: url,
          id: id
        });
      });
    }

    return card;
  },

  unload: function(card) {
    var cardArray = this.cards[card.url][card.id],
        cardIndex = cardArray.indexOf(card);

    card.sandbox.conductor = null;

    card.sandbox.terminate();
    delete cardArray[cardIndex];
    cardArray.splice(cardIndex, 1);
  }
};

export default Conductor;

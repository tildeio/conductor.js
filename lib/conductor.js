import Oasis from "oasis";
import Version from "conductor/version";
import CardReference from "conductor/card_reference";
import { requiredUrls, requiredCSSUrls, requireURL, requireCSS } from "conductor/require";
import CardDependencies from "conductor/card_dependencies";
import { o_create, a_forEach, a_indexOf } from "oasis/shims";
import { delegate } from "oasis/util";
import ConductorCapabilities from "conductor/capabilities";
import ConductorShims from "conductor/shims";
import MultiplexService from "conductor/multiplex_service";

function Conductor(options) {
  this.options = options || {};
  this.oasis = new Oasis();
  this.conductorURL = this.options.conductorURL ||
                      // take the default oasisURL from the global Oasis so
                      // sandboxes can inherit
                      oasis.configuration.oasisURL ||
                      'conductor-' + Version + '.js.html';

  this.data = {};
  this.cards = {};
  this._capabilities = new ConductorCapabilities();
}

Conductor.Version = Version;
Conductor.Oasis = Oasis;
Conductor.requiredUrls = requiredUrls;
Conductor.requiredCSSUrls = requiredCSSUrls;
Conductor.require = requireURL;
Conductor.requireCSS = requireCSS;
Conductor.MultiplexService = MultiplexService;

var RSVP = Conductor.Oasis.RSVP,
    Promise = RSVP.Promise;

function coerceId(id) {
  return id + '';
}

Conductor.prototype = {
  configure: function (name, value) {
    if ('eventCallback' === name) {
      this.oasis.configure(name, value);
    } else {
      throw new Error("Unexpected Configuration `" + name + "` = `" + value + "`");
    }
  },

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
        capabilities = this.defaultCapabilities().slice(),
        cardServices = o_create(this.defaultServices()),
        adapter = _options.adapter,
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

    var sandbox = this.oasis.createSandbox({
      url: url,
      capabilities: capabilities,
      oasisURL: this.conductorURL,
      services: cardServices
    });

    sandbox.data = data;
    sandbox.activateDefered = RSVP.defer();
    sandbox.activatePromise = sandbox.activateDefered.promise;

    var card = new CardReference(sandbox);

    this.cards[url] = this.cards[url] || {};
    var cards = this.cards[url][id] = this.cards[url][id] || [];
    cards.push(card);

    card.url = url;
    card.id = id;

    sandbox.conductor = this;
    sandbox.card = card;

    // TODO: it would be better to access the consumer from
    // `conductor.parentCard` after the child card refactoring is in master.
    if (this.oasis.consumers.nestedWiretapping) {
      card.wiretap(function (service, messageEvent) {
        this.oasis.consumers.nestedWiretapping.send(messageEvent.type, {
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
  },

  /**
    @return array the default list of capabilities that will be included for all
    cards.
  */
  defaultCapabilities: delegate('_capabilities', 'defaultCapabilities'),

  /**
    @return object the default services used for the default capabilities.
  */
  defaultServices: delegate('_capabilities', 'defaultServices'),

  /**
    Add a default capability that this conductor will provide to all cards,
    unless the capability is not supported by the specified adapter.

    @param {string} capability the capability to add
    @param {Oasis.Service} [service=Oasis.Service] the default service to use
    for `capability`.  Defaults to a plain `Oasis.Service`.
  */
  addDefaultCapability: delegate('_capabilities', 'addDefaultCapability'),

  // Be careful with this: it does no safety checking, so things will break if
  // one for example removes `data` or `xhr` as a default capability.
  //
  // It is however safe to remove `height`.
  removeDefaultCapability: delegate('_capabilities', 'removeDefaultCapability')
};

export default Conductor;

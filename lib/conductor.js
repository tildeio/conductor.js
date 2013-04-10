(function(globals) {
  var Conductor = globals.Conductor = function(options) {
    this.options = options || {};
    this.data = {};
    this.cards = {};
    this.services = Object.create(Conductor.services);
  };

  Conductor.Oasis = requireModule('oasis');

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

      cards.forEach(function(card) {
        card.updateData('*', data);
      });
    },

    updateData: function(card, bucket, data) {
      var url = card.url,
          id = card.id;

      this.data[url][id][bucket] = data;

      var cards = this.cards[url][id].slice(),
          index = cards.indexOf(card);

      cards.splice(index, 1);

      cards.forEach(function(card) {
        card.updateData(bucket, data);
      });
    },

    load: function(url, id, options) {
      id = coerceId(id);

      var datas = this.data[url],
          data = datas && datas[id],
          _options = options || {},
          extraCapabilities = _options.capabilities || [];

      var capabilities = ['xhr', 'metadata', 'render', 'data', 'lifecycle'];

      capabilities.push.apply(capabilities, extraCapabilities);

      // TODO: this should be a custom service provided in tests
      if (this.options.testing) {
        capabilities.push('assertion');
      }

      var sandbox = Conductor.Oasis.createSandbox({
        url: url,
        capabilities: capabilities,
        oasisURL: '/dist/conductor.js-0.1.0.js',
        services: this.services
      });

      sandbox.data = data;
      sandbox.activatePromise = new Promise();

      sandbox.start();

      var card = new Conductor.CardReference(sandbox);

      this.cards[url] = this.cards[url] || {};
      var cards = this.cards[url][id] = this.cards[url][id] || [];
      cards.push(card);

      card.url = url;
      card.id = id;

      sandbox.conductor = this;
      sandbox.card = card;

      return card;
    }
  };

})(window);

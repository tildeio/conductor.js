define("conductor",
  ["conductor/require","conductor/services","oasis","conductor/version","conductor/card_reference","oasis/shims","conductor/shims","conductor/multiplex_service"],
  function(__dependency1__, __dependency2__, Oasis, Version, CardReference, OasisShims, ConductorShims, MultiplexService) {
    "use strict";
    var requiredUrls = __dependency1__.requiredUrls;
    var requiredCSSUrls = __dependency1__.requiredCSSUrls;
    var requireURL = __dependency1__.requireURL;
    var requireCSS = __dependency1__.requireCSS;
    var services = __dependency2__.services;
    var capabilities = __dependency2__.capabilities;

    var o_create = OasisShims.o_create,
        a_forEach = OasisShims.a_forEach,
        a_indexOf = ConductorShims.a_indexOf;

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
      this.services = o_create(services);
      this.capabilities = capabilities.slice();
    }

    Conductor.services = services;
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
      }
    };


    return Conductor;
  });
define("conductor/assertion_consumer",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var AssertionConsumer = Oasis.Consumer.extend({
      initialize: function() {
        var service = this;

        window.ok = function(bool, message) {
          service.send('ok', { bool: bool, message: message });
        };

        window.equal = function(expected, actual, message) {
          service.send('equal', { expected: expected, actual: actual, message: message });
        };

        window.start = function() {
          service.send('start');
        };
      },

      events: {
        instruct: function(info) {
          this.card.instruct(info);
        }
      }
    });


    return AssertionConsumer;
  });
define("conductor/assertion_service",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var AssertionService = Oasis.Service.extend({
      initialize: function(port) {
        this.sandbox.assertionPort = port;
      },

      events: {
        ok: function(data) {
          ok(data.bool, data.message);
        },

        equal: function (data) {
          equal(data.expected, data.actual, data.message);
        },

        start: function() {
          start();
        }
      }
    });


    return AssertionService;
  });
define("conductor/card",
  ["conductor","oasis","conductor/assertion_consumer","conductor/xhr_consumer","conductor/render_consumer","conductor/metadata_consumer","conductor/data_consumer","conductor/lifecycle_consumer","conductor/height_consumer","conductor/nested_wiretapping_consumer","conductor/multiplex_service","oasis/shims"],
  function(Conductor, Oasis, AssertionConsumer, XhrConsumer, RenderConsumer, MetadataConsumer, DataConsumer, LifecycleConsumer, HeightConsumer, NestedWiretapping, MultiplexService, OasisShims) {
    "use strict";

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
       */
      initializeChildCards: function( data ) {
        var prop;

        if(this.childCards) {
          this.conductor = new Conductor();
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

  });
define("conductor/card_reference",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var RSVP = Oasis.RSVP,
        Promise = RSVP.Promise;

    function CardReference(sandbox) {
      this.sandbox = sandbox;
      var card = this;

      return this;
    }

    CardReference.prototype = {
      waitForLoad: function() {
        var card = this;
        if (!this._loadPromise) {
          this._loadPromise = this.sandbox.waitForLoad().then(function() {
            return card;
          }).fail(RSVP.rethrow);
        }
        return this._loadPromise;
      },

      metadataFor: function(name) {
        return this.sandbox.metadataPort.request('metadataFor', name);
      },

      instruct: function(info) {
        return this.sandbox.assertionPort.send('instruct', info);
      },

      appendTo: function(parent) {
        if (typeof parent === 'string') {
          var selector = parent;
          parent = document.querySelector(selector);
          if (!parent) { throw new Error("You are trying to append to '" + selector + "' but no element matching it was found"); }
        }

        parent.appendChild(this.sandbox.el);

        return this.waitForLoad();
      },

      render: function(intent, dimensions) {
        var card = this;

        this.sandbox.activatePromise.then(function() {
          card.sandbox.renderPort.send('render', [intent, dimensions]);
        }).fail(RSVP.rethrow);
      },

      updateData: function(bucket, data) {
        var sandbox = this.sandbox;
        sandbox.activatePromise.then(function() {
          sandbox.dataPort.send('updateData', { bucket: bucket, data: data });
        }).fail(RSVP.rethrow);
      },

      wiretap: function(callback, binding) {
        this.sandbox.wiretap(function() {
          callback.apply(binding, arguments);
        });
      },

      destroy: function() {
        this.sandbox.conductor.unload(this);
      }
    };

    Oasis.RSVP.EventTarget.mixin(CardReference.prototype);


    return CardReference;
  });
define("conductor/data_consumer",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var DataConsumer = Oasis.Consumer.extend({
      events: {
        initializeData: function(data) {
          this.card.data = data;
          this.card.deferred.data.resolve(data);
        },

        updateData: function(data) {
          if (data.bucket === '*') {
            this.card.data = data.data;
          } else {
            this.card.data[data.bucket] = data.data;
          }

          if (this.card.didUpdateData) {
            this.card.didUpdateData(data.bucket, data.data);
          }
        }
      }
    });


    return DataConsumer;
  });
define("conductor/data_service",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var DataService = Oasis.Service.extend({
      initialize: function(port) {
        var data = this.sandbox.data;
        this.send('initializeData', data);

        this.sandbox.dataPort = port;
      },

      events: {
        updateData: function(event) {
          this.sandbox.conductor.updateData(this.sandbox.card, event.bucket, event.object);
        }
      }
    });


    return DataService;
  });
define("conductor/dom",
  [],
  function() {
    "use strict";
    /* global DomUtils:true */

    var DomUtils = {};

    if (typeof window !== "undefined") {
      if (window.getComputedStyle) {
        DomUtils.getComputedStyleProperty = function (element, property) {
          return window.getComputedStyle(element)[property];
        };
      } else {
        DomUtils.getComputedStyleProperty = function (element, property) {
          var prop = property.replace(/-(\w)/g, function (_, letter) {
            return letter.toUpperCase();
          });
          return element.currentStyle[prop];
        };
      }
    }

    DomUtils.createStyleElement = function(css) {
      var style = document.createElement('style');

      style.type = 'text/css';
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }

      return style;
    };


    return DomUtils;
  });
define("conductor/error",
  ["exports"],
  function(__exports__) {
    "use strict";
    function error(exception) {
      if (typeof console === 'object' && console.assert && console.error) {
        // chrome does not (yet) link the URLs in `console.assert`
        console.error(exception.stack);
        console.assert(false, exception.message);
      }
      setTimeout( function () {
        throw exception;
      }, 1);
      throw exception;
    }

    function warn() {
      if (console.warn) {
        return console.warn.apply(this, arguments);
      }
    }

    __exports__.error = error;
    __exports__.warn = warn;
  });
define("conductor/height_consumer",
  ["oasis","conductor","conductor/dom"],
  function(Oasis, Conductor, DomUtils) {
    "use strict";
    /*global MutationObserver:true */

    /**
      The height consumer reports changes to the `documentElement`'s element to its
      parent environment.  This is obviated by the ALLOWSEAMLESS proposal, but no
      browser supports it yet.

      There are two mechanisms for reporting dimension changes: automatic (via DOM
      mutation observers) and manual.  By default, height resizing is automatic.  It
      must be disabled during card activation if `MutationObserver` is not
      supported.  It may be disabled during card activation if manual updates are
      preferred.

      Automatic updating can be disabled as follows:

      ```js
      Conductor.card({
        activate: function () {
          this.consumers.height.autoUpdate = false;
        }
      })
      ```

      Manual updates can be done either with specific dimensions, or manual updating
      can compute the dimensions.

      ```js
      card = Conductor.card({ ... });

      card.consumers.height.update({ width: 200, height: 200 });

      // dimensions of `document.body` will be computed.
      card.consumers.height.update();
      ```
    */

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var HeightConsumer = Oasis.Consumer.extend({
      autoUpdate: true,

      initialize: function () {
        var consumer = this;

        this.card.waitForActivation().then(function () {
          if (!consumer.autoUpdate) {
            return;
          } else if (typeof MutationObserver === "undefined") {
            Conductor.warn("MutationObserver is not defined.  Height service cannot autoupdate.  You must manually call `update` for your height consumer.  You may want to disable autoupdate when your card activates with `this.consumers.height.autoUpdate = false;`");
            return;
          }

          consumer.setUpAutoupdate();
        });
      },

      update: function (dimensions) {
        if (typeof dimensions === "undefined") {
          var width = 0,
              height = 0,
              childNodes = document.body.childNodes,
              len = childNodes.length,
              extraVSpace = 0,
              extraHSpace = 0,
              vspaceProps = ['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'],
              hspaceProps = ['marginLeft', 'marginRight', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'],
              i,
              childNode;

          for (i=0; i < vspaceProps.length; ++i) {
            extraVSpace += parseInt(DomUtils.getComputedStyleProperty(document.body, vspaceProps[i]), 10);
          }

          for (i=0; i < hspaceProps.length; ++i) {
            extraHSpace += parseInt(DomUtils.getComputedStyleProperty(document.body, hspaceProps[i]), 10);
          }

          for (i = 0; i < len; ++i) {
            childNode = childNodes[i];
            if (childNode.nodeType !== 1 /* Node.ELEMENT_NODE */ ) { continue; }

            width = Math.max(width, childNode.clientWidth + extraHSpace);
            height = Math.max(height, childNode.clientHeight + extraVSpace);
          }

          dimensions = {
            width: width,
            height: height
          };
        }

        this.send('resize', dimensions);
      },

      setUpAutoupdate: function () {
        var consumer = this;

        var mutationObserver = new MutationObserver(function () {
          consumer.update();
        });

        mutationObserver.observe(document.documentElement, {
          childList: true,
          attributes: true,
          characterData: true,
          subtree: true,
          attributeOldValue: false,
          characterDataOldValue: false,
          attributeFilter: ['style', 'className']
        });
      }
    });


    return HeightConsumer;
  });
define("conductor/height_service",
  ["oasis","conductor/dom"],
  function(Oasis, DomUtils) {
    "use strict";
    /*global DomUtils*/

    function maxDim(element, dim) {
      var max = DomUtils.getComputedStyleProperty(element, 'max' + dim);
      return (max === "none") ? Infinity : parseInt(max, 10);
    }

    var HeightService = Oasis.Service.extend({
      initialize: function (port) {
        var el;
        if (el = this.sandbox.el) {
          Oasis.RSVP.EventTarget.mixin(el);
        }
        this.sandbox.heightPort = port;
      },

      events: {
        resize: function (data) {
          // height service is meaningless for DOMless sandboxes, eg sandboxed as
          // web workers.
          if (! this.sandbox.el) { return; }

          var el = this.sandbox.el,
              maxWidth = maxDim(el, 'Width'),
              maxHeight = maxDim(el, 'Height'),
              width = Math.min(data.width, maxWidth),
              height = Math.min(data.height, maxHeight);

          el.style.width = width + "px";
          el.style.height = height + "px";

          el.trigger('resize', { width: width, height: height });
        }
      }
    });


    return HeightService;
  });
define("conductor/lifecycle_consumer",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var LifecycleConsumer = Oasis.Consumer.extend({
      initialize: function() {
        var consumer = this;

        this.card.waitForActivation().then(function() {
          consumer.send('activated');
        });
      }
    });


    return LifecycleConsumer;
  });
define("conductor/lifecycle_service",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var LifecycleService = Oasis.Service.extend({
      events: {
        activated: function() {
          this.sandbox.activateDefered.resolve();
        }
      }
    });


    return LifecycleService;
  });
define("conductor/metadata_consumer",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var MetadataConsumer = Oasis.Consumer.extend({
      requests: {
        metadataFor: function(name) {
          if (name === '*') {
            var values = [], names = [];

            for (var metadataName in this.card.options.metadata) {
              values.push(this.card.metadata[metadataName].call(this.card));
              names.push(metadataName);
            }

            return Oasis.RSVP.all(values).then(function(sources) {
              var metadata = {};

              for (var i = 0; i < sources.length; i++) {
                var name = names[i];
                for (var key in sources[i]) {
                  metadata[name+':'+key] = sources[i][key];
                }
              }

              return metadata;
            });

          } else {
            return this.card.metadata[name].call(this.card);
          }
        }
      }
    });


    return MetadataConsumer;
  });
define("conductor/metadata_service",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var MetadataService = Oasis.Service.extend({
      initialize: function(port) {
        this.sandbox.metadataPort = port;
      }
    });


    return MetadataService;
  });
define("conductor/multiplex_service",
  ["oasis"],
  function(Oasis) {
    "use strict";
    /**
      Passes requests from each instance to `upstream`, a
      `Conductor.Oasis.Consumer`, and sends the responses back to the instance.
      This differs from simply passing `upstream`'s port to nested cards in two
      ways:

        1. `upstream` can still be used within the current card and
        2. requests from multiple nested cards can be sent to `upstream`.

      This is useful for cards who cannot fulfill dependency requests of its child
      cards, but whose containing environment can.


      Example:

        Conductor.card({
          activate: function () {
            var conductor = new Conductor();

            // nested conductor cannot load required resources, but its containing
            // environment can (possibly by passing the request up through its own
            // multiplex service).
            conductor.services.xhr =  Conductor.MultiplexService.extend({
                                        upstream: this.consumers.xhr
                                      });

            // now the nested card can `Conductor.require` resources normally.
            conductor.card.load("/nested/card/url.js");
          }
        });
    */


    var MultiplexService = Oasis.Service.extend({
      initialize: function () {
        this.port.all(function (eventName, data) {
          if (eventName.substr(0, "@request:".length) === "@request:") {
            this.propagateRequest(eventName, data);
          } else {
            this.propagateEvent(eventName, data);
          }
        }, this);
      },

      propagateEvent: function (eventName, _data) {
        var data = (typeof this.transformEvent === 'function') ? this.transformEvent(eventName, _data) : _data;
        this.upstream.send(eventName, data);
      },

      propagateRequest: function (eventName, _data) {
        var requestEventName = eventName.substr("@request:".length),
            port = this.upstream.port,
            data = (typeof this.transformRequest === 'function') ? this.transformRequest(requestEventName, _data) : _data,
            requestId = data.requestId,
            args = data.args,
            self = this;

        args.unshift(requestEventName);
        port.request.apply(port, args).then(function (responseData) {
          self.send('@response:' + requestEventName, {
            requestId: requestId,
            data: responseData
          });
        });
      }
    });


    return MultiplexService;
  });
define("conductor/nested_wiretapping_consumer",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var NestedWiretapping = Oasis.Consumer;


    return NestedWiretapping;
  });
define("conductor/nested_wiretapping_service",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var NestedWiretappingService = Oasis.Service.extend({
      initialize: function (port) {
        this.sandbox.nestedWiretappingPort = port;
      }
    });


    return NestedWiretappingService;
  });
define("conductor/path",
  ["conductor/shims"],
  function(ConductorShims) {
    "use strict";
    /* global PathUtils:true */

    var a_filter = ConductorShims.a_filter;

    var PathUtils = window.PathUtils = {
      dirname: function (path) {
        return path.substring(0, path.lastIndexOf('/'));
      },

      expandPath: function (path) {
        var parts = path.split('/');
        for (var i = 0; i < parts.length; ++i) {
          if (parts[i] === '..') {
            for (var j = i-1; j >= 0; --j) {
              if (parts[j] !== undefined) {
                parts[i] = parts[j] = undefined;
                break;
              }
            }
          }
        }
        return a_filter.call(parts, function (part) { return part !== undefined; }).join('/');
      },

      cardResourceUrl: function(baseUrl, resourceUrl) {
        var url;
        if (/^((http(s?):)|\/)/.test(resourceUrl)) {
          url = resourceUrl;
        } else {
          url = PathUtils.dirname(baseUrl) + '/' + resourceUrl;
        }

        return PathUtils.expandPath(url);
      }
    };


    return PathUtils;
  });
define("conductor/render_consumer",
  ["oasis","conductor/dom"],
  function(Oasis, DomUtils) {
    "use strict";
    /*global DomUtils */


    var domInitialized = false;

    function resetCSS() {
      var head = document.head || document.documentElement.getElementsByTagName('head')[0],
          css = "",
          newStyle;

      css += "body {";
      css += "  margin: 0px;";
      css += "  padding: 0px;";
      css += "}";

      css += "iframe {";
      css += "  display: block;";
      css += "}";

      newStyle = DomUtils.createStyleElement(css);

      head.insertBefore(newStyle, head.children[0]);
    }

    var RenderConsumer = Oasis.Consumer.extend({
      events: {
        render: function(args) {
          if(!domInitialized) {
            resetCSS();

            if(this.card.initializeDOM) {
              this.card.initializeDOM();
            }

            domInitialized = true;
          }
          this.card.render.apply(this.card, args);
        }
      }
    });


    return RenderConsumer;
  });
define("conductor/render_service",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var RenderService = Oasis.Service.extend({
      initialize: function(port) {
        this.sandbox.renderPort = port;
      }
    });


    return RenderService;
  });
define("conductor/require",
  ["exports"],
  function(__exports__) {
    "use strict";
    var requiredUrls = [];
    var requiredCSSUrls = [];

    function requireURL(url) {
      requiredUrls.push(url);
    }

    function requireCSS(url) {
      requiredCSSUrls.push(url);
    }

    __exports__.requiredUrls = requiredUrls;
    __exports__.requiredCSSUrls = requiredCSSUrls;
    __exports__.requireURL = requireURL;
    __exports__.requireCSS = requireCSS;
  });
define("conductor/services",
  ["conductor/assertion_service","conductor/xhr_service","conductor/render_service","conductor/metadata_service","conductor/data_service","conductor/lifecycle_service","conductor/height_service","conductor/nested_wiretapping_service","exports"],
  function(AssertionService, XhrService, RenderService, MetadataService, DataService, LifecycleService, HeightService, NestedWiretappingService, __exports__) {
    "use strict";

    /**
      Default Conductor services provided to every conductor instance.
    */
    var services = {
      xhr: XhrService,
      metadata: MetadataService,
      assertion: AssertionService,
      render: RenderService,
      lifecycle: LifecycleService,
      data: DataService,
      height: HeightService,
      nestedWiretapping: NestedWiretappingService
    };

    var capabilities = [
      'xhr', 'metadata', 'render', 'data', 'lifecycle', 'height',
      'nestedWiretapping'
    ];

    __exports__.services = services;
    __exports__.capabilities = capabilities;
  });
define("conductor/shims",
  ["exports"],
  function(__exports__) {
    "use strict";
    function isNativeFunc(func) {
      // This should probably work in all browsers likely to have ES5 array methods
      return func && Function.prototype.toString.call(func).indexOf('[native code]') > -1;
    }

    var a_filter = isNativeFunc(Array.prototype.filter) ? Array.prototype.filter : function(fun /*, thisp*/) {
      "use strict";

      if (this == null)
        throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun != "function")
        throw new TypeError();

      var res = [];
      var thisp = arguments[1];
      for (var i = 0; i < len; i++)
      {
        if (i in t)
        {
          var val = t[i]; // in case fun mutates this
          if (fun.call(thisp, val, i, t))
            res.push(val);
        }
      }

      return res;
    };

    var a_indexOf = isNativeFunc(Array.prototype.indexOf) ? Array.prototype.indexOf : function (searchElement /*, fromIndex */ ) {
      "use strict";
      if (this == null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;

      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) { // shortcut for verifying if it's NaN
          n = 0;
        } else if (n != 0 && n != Infinity && n != -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };


    __exports__.a_filter = a_filter;
    __exports__.a_indexOf = a_indexOf;
  });
define("conductor/version",
  [],
  function() {
    "use strict";

    return '0.3.0';
  });
define("conductor/xhr_consumer",
  ["oasis","conductor/require","oasis/shims","conductor/dom"],
  function(Oasis, ConductorRequire, OasisShims, DomUtils) {
    "use strict";

    var a_forEach = OasisShims.a_forEach;

    var XhrConsumer = Oasis.Consumer.extend({
      initialize: function() {
        var promises = [],
            jsPromises = [],
            port = this.port,
            promise = this.card.deferred.xhr;

        function loadURL(callback) {
          return function(url) {
            var promise = port.request('get', url);
            promises.push(promise);
            promise.then(callback);
          };
        }

        function processJavaScript(data) {
          var script = document.createElement('script');
          // textContent is ie9+
          script.text = script.textContent = data;
          document.body.appendChild(script);
        }

        function processCSS(data) {
          var head = document.head || document.documentElement.getElementsByTagName('head')[0],
              style = DomUtils.createStyleElement(data);
          head.appendChild(style);
        }

        a_forEach.call(ConductorRequire.requiredUrls, function( url ) {
          var promise = port.request('get', url);
          jsPromises.push( promise );
          promises.push(promise);
        });
        Oasis.RSVP.all(jsPromises).then(function(scripts) {
          a_forEach.call(scripts, processJavaScript);
        }).fail( Oasis.RSVP.rethrow );
        a_forEach.call(ConductorRequire.requiredCSSUrls, loadURL(processCSS));

        Oasis.RSVP.all(promises).then(function() { promise.resolve(); }).fail( Oasis.RSVP.rethrow );
      }
    });


    return XhrConsumer;
  });
define("conductor/xhr_service",
  ["oasis/xhr","oasis","conductor/path"],
  function(__dependency1__, Oasis, PathUtils) {
    "use strict";
    var xhr = __dependency1__.xhr;
    /*global PathUtils */

    var XhrService = Oasis.Service.extend({
      requests: {
        get: function(url) {
          var service = this;
          var resourceUrl = PathUtils.cardResourceUrl(service.sandbox.options.url, url);

          return xhr(resourceUrl);
        }
      }
    });


    return XhrService;
  });
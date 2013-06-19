define("conductor",
  ["oasis"],
  function(Oasis) {
    "use strict";

    var Conductor = function(options) {
      this.options = options || {};
      this.conductorURL = this.options.conductorURL || 
                          Oasis.config.oasisURL ||
                          '/dist/conductor.js-0.2.0.js.html';

      this.data = {};
      this.cards = {};
      this.services = Object.create(Conductor.services);
      this.capabilities = Conductor.capabilities.slice();
    };

    Conductor.error = function (error) {
      if (typeof console === 'object' && console.assert && console.error) {
        // chrome does not (yet) link the URLs in `console.assert`
        console.error(error.stack);
        console.assert(false, error.message);
      } else {
        setTimeout( function () {
          throw error;
        }, 1);
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
            extraCapabilities = _options.capabilities || [],
            capabilities = this.capabilities.slice();

        capabilities.push.apply(capabilities, extraCapabilities);

        // TODO: this should be a custom service provided in tests
        if (this.options.testing) {
          capabilities.push('assertion');
        }

        var sandbox = Conductor.Oasis.createSandbox({
          url: url,
          capabilities: capabilities,
          oasisURL: this.conductorURL,
          services: this.services
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
      }
    };


    var DomUtils = {};

    if (typeof window !== "undefined") {
      if (window.getComputedStyle) {
        DomUtils.getComputedStyleProperty = function (element, property) {
          return window.getComputedStyle(element)[property];
        };
      } else if (document.body.currentStyle) {
        DomUtils.getComputedStyleProperty = function (element, property) {
          var prop = property.replace(/-(\w)/g, function (_, letter) {
            return letter.toUpperCase();
          });
          return element.currentStyle[prop];
        };
      } else {
        throw new Error("Browser lacks support for both `getComputedStyle` and `currentStyle`");
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
        return parts.filter(function (part) { return part !== undefined; }).join('/');
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
        var card = this;

        for (var prop in options) {
          this[prop] = options[prop];
        }

        this.consumers = Object.create(Conductor.Oasis.consumers);
        this.options = options = options || {};

        var renderDefered = this.defer();

        var xhrDefered = this.defer();

        options.events = options.events || {};
        options.requests = options.requests || {};

        var assertionDefered = this.defer();
        var dataDefered = this.defer();

        var activatePromise = this.activateWhen(dataDefered.promise, [ xhrDefered.promise ]);

        this.promise = new Promise(function (resolve, reject) {
          activatePromise.then(function () {
            resolve(card);
          }, Conductor.error);
        });

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

        for (var prop in cardOptions.consumers) {
          cardOptions.consumers[prop] = cardOptions.consumers[prop].extend({card: this});
        };

        Conductor.Oasis.connect(cardOptions);
      };

      Conductor.Card.prototype = {
        defer: function(callback) {
          var defered = RSVP.defer();
          if (callback) { defered.promise.then(callback, Conductor.error); }
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
                  data.args = data.args.map(function (resourceUrl) {
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
            this.childCards.forEach(function(cardInfo) {
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

            if (card.activate) { card.activate(resolutions[0]); }
          });
        }
      };

      Conductor.card = function(options) {
        return new Conductor.Card(options);
      };
    })();

    (function() {

    var Promise = Conductor.Oasis.RSVP.Promise;

    var CardReference = Conductor.CardReference = function(sandbox) {
      this.sandbox = sandbox;
      var card = this;

      // TODO: can we just resolve(sandbox.promise)?
      this.promise = new Promise(function (resolve, reject) {
        sandbox.promise.then(function() {
          resolve(card);
        }, Conductor.error);
      });

      return this;
    };

    CardReference.prototype = {
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

        return this;
      },

      render: function(intent, dimensions) {
        var card = this;

        this.sandbox.activatePromise.then(function() {
          card.sandbox.renderPort.send('render', [intent, dimensions]);
        }, Conductor.error);
      },

      updateData: function(bucket, data) {
        var sandbox = this.sandbox;
        sandbox.activatePromise.then(function() {
          sandbox.dataPort.send('updateData', { bucket: bucket, data: data });
        }, Conductor.error);
      },

      wiretap: function(callback, binding) {
        this.sandbox.wiretap(function() {
          callback.apply(binding, arguments);
        });
      }
    };

    Conductor.Oasis.RSVP.EventTarget.mixin(CardReference.prototype);

    })();


    Conductor.assertionConsumer = function(promise, card) {
      return Conductor.Oasis.Consumer.extend({
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

          promise.resolve();
        },

        events: {
          instruct: function(info) {
            card.instruct(info);
          }
        }
      });
    };

    Conductor.dataConsumer = function(promise, card) {
      return Conductor.Oasis.Consumer.extend({
        events: {
          initializeData: function(data) {
            card.data = data;
            promise.resolve(data);
          },

          updateData: function(data) {
            if (data.bucket === '*') {
              card.data = data.data;
            } else {
              card.data[data.bucket] = data.data;
            }

            if (card.didUpdateData) {
              card.didUpdateData(data.bucket, data.data);
            }
          }
        }
      });
    };

    /*global DomUtils*/

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
    Conductor.heightConsumer = function (card) {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

      return Conductor.Oasis.Consumer.extend({
        autoUpdate: true,

        initialize: function () {
          var consumer = this;

          card.promise.then(function () {
            if (!consumer.autoUpdate) {
              return;
            } else if (typeof MutationObserver === "undefined") {
              throw new Error("MutationObserver is not defined.  You must disable height autoupdate when your card activates with `this.consumers.height.autoUpdate = false`");
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
              if (childNode.nodeType !== Node.ELEMENT_NODE ) { continue; }

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
    };

    Conductor.lifecycleConsumer = function(promise) {
      return Conductor.Oasis.Consumer.extend({
        initialize: function() {
          var consumer = this;

          promise.then(function() {
            consumer.send('activated');  
          });
        }
      });
    };

    Conductor.metadataConsumer = function(card) {
      var options = card.options;

      options.requests.metadataFor = function(resolver, name) {
        if (name === '*') {
          var promises = [], names = [], defered;

          for (var metadataName in options.metadata) {
            defered = Conductor.Oasis.RSVP.defer();
            card.metadata[metadataName].call(card, defered);
            promises.push(defered.promise);
            names.push(metadataName);
          }

          Conductor.Oasis.RSVP.all(promises).then(function(sources) {
            var metadata = {};

            for (var i = 0; i < sources.length; i++) {
              var name = names[i];
              for (var key in sources[i]) {
                metadata[name+':'+key] = sources[i][key];
              }
            }

            resolver.resolve(metadata);
          });

        } else {
          card.metadata[name].call(card, resolver);
        }
      };

      return Conductor.Oasis.Consumer.extend(options);
    };

    Conductor.nestedWiretapping = function (card) {
      return Conductor.Oasis.Consumer;
    };

    /*global DomUtils*/

    Conductor.renderConsumer = function(promise, card) {
      var options = Object.create(card.options);
      var domInitialized = false;

      function resetCSS() {
        var css = "",
            newStyle;

        css += "html, body {";
        css += "  margin: 0px;";
        css += "  padding: 0px;";
        css += "}";

        css += "iframe {";
        css += "  display: block;";
        css += "}";

        newStyle = DomUtils.createStyleElement(css);

        document.head.insertBefore(newStyle, document.head.children[0]);
      }

      options.events.render = function(args) {
        if(!domInitialized) {
          resetCSS();

          if(card.initializeDOM) {
            card.initializeDOM();
          }

          domInitialized = true;
        }
        card.render.apply(card, args);
      };

      return Conductor.Oasis.Consumer.extend(options);
    };

    /*global DomUtils*/

    Conductor.xhrConsumer = function(requiredUrls, requiredCSSUrls, promise, card) {
      var options = Object.create(card.options);

      options.initialize = function() {
        var promises = [],
            jsPromises = [],
            port = this.port;

        function loadURL(callback) {
          return function(url) {
            var promise = port.request('get', url);
            promises.push(promise);
            promise.then(callback);
          };
        }

        function processJavaScript(data) {
          var script = document.createElement('script');
          script.textContent = data;
          document.body.appendChild(script);
        }

        function processCSS(data) {
          var style = DomUtils.createStyleElement(data);
          document.head.appendChild(style);
        }

        requiredUrls.forEach( function( url ) {
          var promise = port.request('get', url);
          jsPromises.push( promise );
          promises.push(promise);
        });
        Conductor.Oasis.RSVP.all(jsPromises).then(function(scripts) {
          scripts.forEach(processJavaScript);
        });
        requiredCSSUrls.forEach(loadURL(processCSS));

        Conductor.Oasis.RSVP.all(promises).then(function() { promise.resolve(); });
      };

      return Conductor.Oasis.Consumer.extend(options);
    };

    Conductor.AssertionService = Conductor.Oasis.Service.extend({
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

    Conductor.DataService = Conductor.Oasis.Service.extend({
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

    /*global DomUtils*/

    function maxDim(element, dim) {
      var max = DomUtils.getComputedStyleProperty(element, 'max' + dim);
      return (max === "none") ? Infinity : parseInt(max, 10);
    }

    Conductor.HeightService = Conductor.Oasis.Service.extend({
      initialize: function (port) {
        var el;
        if (el = this.sandbox.el) {
          Conductor.Oasis.RSVP.EventTarget.mixin(el);
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

    Conductor.LifecycleService = Conductor.Oasis.Service.extend({
      events: {
        activated: function() {
          this.sandbox.activateDefered.resolve();
        }
      }
    });

    Conductor.MetadataService = Conductor.Oasis.Service.extend({
      initialize: function(port) {
        this.sandbox.metadataPort = port;
      }
    });

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
    Conductor.MultiplexService = Conductor.Oasis.Service.extend({
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

    Conductor.NestedWiretappingService = Conductor.Oasis.Service.extend({
      initialize: function (port) {
        this.sandbox.nestedWiretappingPort = port;
      }
    });

    Conductor.RenderService = Conductor.Oasis.Service.extend({
      initialize: function(port) {
        this.sandbox.renderPort = port;
      }
    });

    /*global PathUtils */

    Conductor.XHRService = Conductor.Oasis.Service.extend({
      requests: {
        get: function(promise, url) {
          var xhr = new XMLHttpRequest(),
              resourceUrl = PathUtils.cardResourceUrl(this.sandbox.options.url, url);

          xhr.onload = function(a1, a2, a3, a4) {
            if (this.status === 200) {
              promise.resolve(this.responseText);
            } else {
              promise.reject({status: this.status});
            }
          };
          xhr.open("get", resourceUrl, true);
          xhr.send();
        }
      }
    });

    /**
      Default Conductor services provided to every conductor instance.
    */
    Conductor.services = {
      xhr: Conductor.XHRService,
      metadata: Conductor.MetadataService,
      assertion: Conductor.AssertionService,
      render: Conductor.RenderService,
      lifecycle: Conductor.LifecycleService,
      data: Conductor.DataService,
      height: Conductor.HeightService,
      nestedWiretapping: Conductor.NestedWiretappingService
    };

    Conductor.capabilities = [
      'xhr', 'metadata', 'render', 'data', 'lifecycle', 'height',
      'nestedWiretapping'
    ];

    return Conductor;
  });
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();

define("rsvp",
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {};

    var browserGlobal = (typeof window !== 'undefined') ? window : {};

    var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var RSVP;

    if (typeof process !== 'undefined' &&
      {}.toString.call(process) === '[object process]') {
      config.async = function(callback, binding) {
        process.nextTick(function() {
          callback.call(binding);
        });
      };
    } else if (MutationObserver) {
      var queue = [];

      var observer = new MutationObserver(function() {
        var toProcess = queue.slice();
        queue = [];

        toProcess.forEach(function(tuple) {
          var callback = tuple[0], binding = tuple[1];
          callback.call(binding);
        });
      });

      var element = document.createElement('div');
      observer.observe(element, { attributes: true });

      // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
      window.addEventListener('unload', function(){
        observer.disconnect();
        observer = null;
      });

      config.async = function(callback, binding) {
        queue.push([callback, binding]);
        element.setAttribute('drainQueue', 'drainQueue');
      };
    } else {
      config.async = function(callback, binding) {
        setTimeout(function() {
          callback.call(binding);
        }, 1);
      };
    }

    var Event = function(type, options) {
      this.type = type;

      for (var option in options) {
        if (!options.hasOwnProperty(option)) { continue; }

        this[option] = options[option];
      }
    };

    var indexOf = function(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i][0] === callback) { return i; }
      }

      return -1;
    };

    var callbacksFor = function(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    };

    var EventTarget = {
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
        return object;
      },

      on: function(eventNames, callback, binding) {
        var allCallbacks = callbacksFor(this), callbacks, eventName;
        eventNames = eventNames.split(/\s+/);
        binding = binding || this;

        while (eventName = eventNames.shift()) {
          callbacks = allCallbacks[eventName];

          if (!callbacks) {
            callbacks = allCallbacks[eventName] = [];
          }

          if (indexOf(callbacks, callback) === -1) {
            callbacks.push([callback, binding]);
          }
        }
      },

      off: function(eventNames, callback) {
        var allCallbacks = callbacksFor(this), callbacks, eventName, index;
        eventNames = eventNames.split(/\s+/);

        while (eventName = eventNames.shift()) {
          if (!callback) {
            allCallbacks[eventName] = [];
            continue;
          }

          callbacks = allCallbacks[eventName];

          index = indexOf(callbacks, callback);

          if (index !== -1) { callbacks.splice(index, 1); }
        }
      },

      trigger: function(eventName, options) {
        var allCallbacks = callbacksFor(this),
            callbacks, callbackTuple, callback, binding, event;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callbackTuple = callbacks[i];
            callback = callbackTuple[0];
            binding = callbackTuple[1];

            if (typeof options !== 'object') {
              options = { detail: options };
            }

            event = new Event(eventName, options);
            callback.call(binding, event);
          }
        }
      }
    };

    var Promise = function() {
      this.on('promise:resolved', function(event) {
        this.trigger('success', { detail: event.detail });
      }, this);

      this.on('promise:failed', function(event) {
        this.trigger('error', { detail: event.detail });
      }, this);
    };

    var noop = function() {};

    var invokeCallback = function(type, promise, callback, event) {
      var hasCallback = typeof callback === 'function',
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(event.detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = event.detail;
        succeeded = true;
      }

      if (value && typeof value.then === 'function') {
        value.then(function(value) {
          promise.resolve(value);
        }, function(error) {
          promise.reject(error);
        });
      } else if (hasCallback && succeeded) {
        promise.resolve(value);
      } else if (failed) {
        promise.reject(error);
      } else {
        promise[type](value);
      }
    };

    Promise.prototype = {
      then: function(done, fail) {
        var thenPromise = new Promise();

        if (this.isResolved) {
          config.async(function() {
            invokeCallback('resolve', thenPromise, done, { detail: this.resolvedValue });
          }, this);
        }

        if (this.isRejected) {
          config.async(function() {
            invokeCallback('reject', thenPromise, fail, { detail: this.rejectedValue });
          }, this);
        }

        this.on('promise:resolved', function(event) {
          invokeCallback('resolve', thenPromise, done, event);
        });

        this.on('promise:failed', function(event) {
          invokeCallback('reject', thenPromise, fail, event);
        });

        return thenPromise;
      },

      resolve: function(value) {
        resolve(this, value);

        this.resolve = noop;
        this.reject = noop;
      },

      reject: function(value) {
        reject(this, value);

        this.resolve = noop;
        this.reject = noop;
      }
    };

    function resolve(promise, value) {
      config.async(function() {
        promise.trigger('promise:resolved', { detail: value });
        promise.isResolved = true;
        promise.resolvedValue = value;
      });
    }

    function reject(promise, value) {
      config.async(function() {
        promise.trigger('promise:failed', { detail: value });
        promise.isRejected = true;
        promise.rejectedValue = value;
      });
    }

    function all(promises) {
      var i, results = [];
      var allPromise = new Promise();
      var remaining = promises.length;

      if (remaining === 0) {
        allPromise.resolve([]);
      }

      var resolver = function(index) {
        return function(value) {
          resolve(index, value);
        };
      };

      var resolve = function(index, value) {
        results[index] = value;
        if (--remaining === 0) {
          allPromise.resolve(results);
        }
      };

      var reject = function(error) {
        allPromise.reject(error);
      };

      for (i = 0; i < remaining; i++) {
        promises[i].then(resolver(i), reject);
      }
      return allPromise;
    }

    EventTarget.mixin(Promise.prototype);

    function configure(name, value) {
      config[name] = value;
    }

    __exports__.Promise = Promise;
    __exports__.Event = Event;
    __exports__.EventTarget = EventTarget;
    __exports__.all = all;
    __exports__.configure = configure;
  });

define("oasis",
  ["rsvp"],
  function(RSVP) {
    "use strict";

    function assert(assertion, string) {
      if (!assertion) {
        throw new Error(string);
      }
    }

    function verifySandbox() {
      var iframe = document.createElement('iframe');

      iframe.sandbox = 'allow-scripts';
      assert(iframe.getAttribute('sandbox') === 'allow-scripts', "The current version of Oasis requires Sandboxed iframes, which are not supported on your current platform. See http://caniuse.com/#feat=iframe-sandbox");

      assert(typeof MessageChannel !== 'undefined', "The current version of Oasis requires MessageChannel, which is not supported on your current platform. A near-future version of Oasis will polyfill MessageChannel using the postMessage API");
    }

    //verifySandbox();

    var Oasis = {};

    // ADAPTERS

    function generateSrc(sandboxURL, oasisURL, dependencyURLs) {
      function importScripts() {}

      dependencyURLs = dependencyURLs || [];
      oasisURL = oasisURL || "oasis.js";

      var link = document.createElement("a");
      link.href = "!";
      var base = link.href.slice(0, -1);

      var src = "data:text/html,<!doctype html>";
      src += "<base href='" + base + "'>";
      src += "<script src='"+oasisURL+"'><" + "/script>";
      src += "<script>" + importScripts.toString() + "<" + "/script>";
      dependencyURLs.forEach(function(url) {
        src += "<script src='" + url + "'><" + "/script>";
      });
      src += "<script src='" + sandboxURL + "'><" + "/script>";
      return src;
    }

    Oasis.adapters = {};

    var iframeAdapter = Oasis.adapters.iframe = {
      initializeSandbox: function(sandbox) {
        var options = sandbox.options,
            iframe = document.createElement('iframe');

        iframe.sandbox = 'allow-same-origin allow-scripts';
        iframe.seamless = true;
        iframe.src = generateSrc(options.url, options.oasisURL, sandbox.dependencies);

        // rendering-specific code
        if (options.width) {
          iframe.width = options.width;
        } else if (options.height) {
          iframe.height = options.height;
        }

        iframe.addEventListener('load', function() {
          sandbox.didInitializeSandbox();
        });

        sandbox.el = iframe;
      },

      createChannel: function(sandbox) {
        var channel = new PostMessageMessageChannel();
        channel.port1.start();
        return channel;
      },

      environmentPort: function(sandbox, channel) {
        return channel.port1;
      },

      sandboxPort: function(sandbox, channel) {
        return channel.port2;
      },

      proxyPort: function(sandbox, port) {
        return port;
      },

      connectPorts: function(sandbox, ports) {
        var rawPorts = ports.map(function(port) { return port.port; });
        sandbox.el.contentWindow.postMessage({ isOasisInitialization: true, capabilities: sandbox.capabilities }, rawPorts, '*');
      },

      startSandbox: function(sandbox) {
        document.head.appendChild(sandbox.el);
      },

      terminateSandbox: function(sandbox) {
        var el = sandbox.el;

        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      },

      // SANDBOX HOOKS
      connectSandbox: function(ports) {
        window.addEventListener('message', function(event) {
          if (!event.data.isOasisInitialization) { return; }

          var capabilities = event.data.capabilities, eventPorts = event.ports;

          capabilities.forEach(function(capability, i) {
            var handler = handlers[capability],
                port = new PostMessagePort(eventPorts[i]);

            if (handler) {
              handler.setupCapability(port);
              port.start();
            }

            ports[capability] = port;
          });
        });
      }
    };

    function generateWebWorkerURL(sandboxURL, dependencyURLs) {
      var link = document.createElement("a");
      link.href = "!";
      var base = link.href.slice(0, -1);

      dependencyURLs = dependencyURLs || [];

      function importScriptsString(url) {
        return "importScripts('" + base + url + "'); ";
      }

      var src = importScriptsString("oasis.js");
      dependencyURLs.forEach(function(url) {
        src += importScriptsString(url);
      });
      src += importScriptsString(sandboxURL);

      var blob = new Blob([src], {type: "application/javascript"});
      return URL.createObjectURL(blob);
    }

    Oasis.adapters.webworker = {
      initializeSandbox: function(sandbox) {
        var url = generateWebWorkerURL(sandbox.options.url, sandbox.dependencies);
        var worker = new Worker(url);
        sandbox.worker = worker;
        setTimeout(function() {
          sandbox.didInitializeSandbox();
        });
      },

      createChannel: function(sandbox) {
        var channel = new PostMessageMessageChannel();
        channel.port1.start();
        return channel;
      },

      environmentPort: function(sandbox, channel) {
        return channel.port1;
      },

      sandboxPort: function(sandbox, channel) {
        return channel.port2;
      },

      proxyPort: function(sandbox, port) {
        return port;
      },

      connectPorts: function(sandbox, ports) {
        var rawPorts = ports.map(function(port) { return port.port; });
        sandbox.worker.postMessage({ isOasisInitialization: true, capabilities: sandbox.capabilities }, rawPorts, '*');
      },

      startSandbox: function(sandbox) { },

      terminateSandbox: function(sandbox) {
        sandbox.worker.terminate();
      },

      connectSandbox: function(ports) {
        self.addEventListener('message', function(event) {
          if (!event.data.isOasisInitialization) { return; }

          var capabilities = event.data.capabilities, eventPorts = event.ports;

          capabilities.forEach(function(capability, i) {
            var handler = handlers[capability],
                port = new PostMessagePort(eventPorts[i]);

            if (handler) {
              handler.setupCapability(port);
              port.start();
            }

            ports[capability] = port;
          });
        });
      }
    };

    // SANDBOXES

    var OasisSandbox = function(options) {
      this.connections = {};
      this.wiretaps = [];

      // Generic capabilities code
      var pkg = packages[options.url];

      var capabilities = options.capabilities;
      if (!capabilities) {
        assert(pkg, "You are trying to create a sandbox from an unregistered URL without providing capabilities. Please use Oasis.register to register your package or pass a list of capabilities to createSandbox.");
        capabilities = pkg.capabilities;
      }

      pkg = pkg || {};

      this.dependencies = options.dependencies || pkg.dependencies;

      this.adapter = options.adapter || iframeAdapter;
      this.capabilities = capabilities;
      this.options = options;

      this.promise = new RSVP.Promise();

      this.adapter.initializeSandbox(this);
    };

    OasisSandbox.prototype = {
      then: function() {
        this.promise.then.apply(this.promise, arguments);
      },

      wiretap: function(callback) {
        this.wiretaps.push(callback);
      },

      connect: function(capability) {
        var promise = new RSVP.Promise();
        var connections;

        connections = this.connections[capability];
        connections = connections || [];

        connections.push(promise);
        this.connections[capability] = connections;

        return promise;
      },

      triggerConnect: function(capability, port) {
        var connections = this.connections[capability];

        if (connections) {
          connections.forEach(function(connection) {
            connection.resolve(port);
          });

          this.connections[capability] = [];
        }
      },

      didInitializeSandbox: function() {
        // Generic services code
        var options = this.options;
        var services = options.services || {};
        var ports = [], channels = this.channels = {};

        this.capabilities.forEach(function(capability) {
          var service = services[capability],
              channel, port;

          // If an existing port is provided, just
          // pass it along to the new sandbox.

          // TODO: This should probably be an OasisPort if possible
          if (service instanceof OasisPort) {
            port = this.adapter.proxyPort(this, service);
          } else {
            channel = channels[capability] = this.adapter.createChannel();

            var environmentPort = this.adapter.environmentPort(this, channel),
                sandboxPort = this.adapter.sandboxPort(this, channel);

            environmentPort.all(function(eventName, data) {
              this.wiretaps.forEach(function(wiretap) {
                wiretap(capability, {
                  type: eventName,
                  data: data,
                  direction: 'received'
                });
              });
            }, this);

            this.wiretaps.forEach(function(wiretap) {
              var originalSend = environmentPort.send;

              environmentPort.send = function(eventName, data) {
                wiretap(capability, {
                  type: eventName,
                  data: data,
                  direction: 'sent'
                });

                originalSend.apply(environmentPort, arguments);
              };
            });

            if (service) {
              /*jshint newcap:false*/
              // Generic
              service = new service(environmentPort, this);
              service.initialize(environmentPort, capability);
            }

            // Generic
            this.triggerConnect(capability, environmentPort);
            // Law of Demeter violation
            port = sandboxPort;
          }

          ports.push(port);
        }, this);

        this.adapter.connectPorts(this, ports);
        this.promise.resolve();
      },

      start: function(options) {
        this.adapter.startSandbox(this, options);
      },

      terminate: function() {
        this.adapter.terminateSandbox(this);
      }
    };

    /**
      This is the entry point that allows the containing environment to create a
      child sandbox.

      Options:

      * `capabilities`: an array of registered services
      * `url`: a registered URL to a JavaScript file that will initialize the
        sandbox in the sandboxed environment
      * `adapter`: a reference to an adapter that will handle the lifecycle
        of the sandbox. Right now, there are iframe and web worker adapters.

      @param {Object} options
    */
    Oasis.createSandbox = function(options) {
      return new OasisSandbox(options);
    };

    /**
      This is a base class that services and consumers can subclass to easily
      implement a number of events and requests at once.

      Example:

          var MetadataService = Oasis.Service.extend({
            initialize: function() {
              this.send('data', this.sandbox.data);
            },

            events: {
              changed: function(data) {
                this.sandbox.data = data;
              }
            },

            requests: {
              valueForProperty: function(name, promise) {
                promise.resolve(this.sandbox.data[name]);
              }
            }
          });

      In the above example, the metadata service implements the Service
      API using `initialize`, `events` and `requests`.

      Both services (implemented in the containing environment) and
      consumers (implemented in the sandbox) use the same API for
      registering events and requests.

      In the containing environment, a service is registered in the
      `createSandbox` method. In the sandbox, a consumer is registered
      using `Oasis.connect`.

      ### `initialize`

      Oasis calls the `initialize` method once the other side of the
      connection has initialized the connection.

      This method is useful to pass initial data back to the other side
      of the connection. You can also set up events or requests manually,
      but you will usually want to use the `events` and `requests` sections
      for events and requests.

      ### `events`

      The `events` object is a list of event names and associated callbacks.
      Oasis will automatically set up listeners for each named event, and
      trigger the callback with the data provided by the other side of the
      connection.

      ### `requests`

      The `requests` object is a list of request names and associated
      callbacks. Oasis will automatically set up listeners for requests
      made by the other side of the connection, and trigger the callback
      with the request information as well as a promise that you should
      use to fulfill the request.

      Once you have the information requested, you should call
      `promise.resolve` with the response data.

      @constructor
      @param {OasisPort} port
      @param {OasisSandbox} sandbox in the containing environment, the
        OasisSandbox that this service is connected to.
    */
    Oasis.Service = function(port, sandbox) {
      var service = this, prop, callback;

      this.sandbox = sandbox;
      this.port = port;

      function xform(callback) {
        return function() {
          callback.apply(service, arguments);
        };
      }

      for (prop in this.events) {
        callback = this.events[prop];
        port.on(prop, xform(callback));
      }

      for (prop in this.requests) {
        callback = this.requests[prop];
        port.onRequest(prop, xform(callback));
      }
    };

    Oasis.Service.prototype = {
      /**
        This hook is called when the connection is established. When
        `initialized` is called, it is safe to register listeners and
        send data to the other side.

        The implementation of Oasis makes it impossible for messages
        to get dropped on the floor due to timing issues.

        @param {OasisPort} port the port to the other side of the connection
        @param {String} name the name of the service
      */
      initialize: function() {},

      /**
        This method can be used to send events to the other side of the
        connection.

        @param {String} eventName the name of the event to send to the
          other side of the connection
        @param {Structured} data an additional piece of data to include
          as the data for the event.
      */
      send: function() {
        return this.port.send.apply(this.port, arguments);
      },

      /**
        This method can be used to request data from the other side of
        the connection.

        @param {String} requestName the name of the request to send to
          the other side of the connection.
        @return {Promise} a promise that will be resolved by the other
          side of the connection. Use `.then` to wait for the resolution.
      */
      request: function() {
        return this.port.request.apply(this.port, arguments);
      }
    };

    Oasis.Service.extend = function extend(object) {
      var superConstructor = this;

      function Service() {
        if (Service.prototype.init) { Service.prototype.init.call(this); }
        superConstructor.apply(this, arguments);
      }

      Service.extend = extend;

      var ServiceProto = Service.prototype = Object.create(this.prototype);

      for (var prop in object) {
        ServiceProto[prop] = object[prop];
      }

      return Service;
    };

    Oasis.Consumer = Oasis.Service;

    // SUBCLASSING

    function extend(parent, object) {
      function OasisObject() {
        parent.apply(this, arguments);
        if (this.initialize) {
          this.initialize.apply(this, arguments);
        }
      }

      OasisObject.prototype = Object.create(parent.prototype);

      for (var prop in object) {
        if (!object.hasOwnProperty(prop)) { continue; }
        OasisObject.prototype[prop] = object[prop];
      }

      return OasisObject;
    }

    // PORTS

    var packages, requestId, oasisId;
    Oasis.reset = function() {
      packages = {};
      requestId = 0;
      oasisId = 'oasis' + (+new Date());
    };
    Oasis.reset();

    var getRequestId = function() {
      return oasisId + '-' + requestId++;
    };

    function mustImplement(className, name) {
      return function() {
        throw new Error("Subclasses of " + className + " must implement " + name);
      };
    }

    /**
      OasisPort is an interface that adapters can use to implement ports.
      Ports are passed into the `initialize` method of services and consumers,
      and are available as `this.port` on services and consumers.

      Ports are the low-level API that can be used to communicate with the
      other side of a connection. In general, you will probably want to use
      the `events` and `requests` objects inside your service or consumer
      rather than manually listen for events and requests.

      @constructor
      @param {OasisPort} port
    */
    function OasisPort(port) {}

    OasisPort.prototype = {
      /**
        This allows you to register an event handler for a particular event
        name.

        @param {String} eventName the name of the event
        @param {Function} callback the callback to call when the event occurs
        @param {any?} binding an optional value of `this` inside of the callback
      */
      on: mustImplement('OasisPort', 'on'),

      /**
        Allows you to register an event handler that is called for all events
        that are sent to the port.
      */
      all: mustImplement('OasisPort', 'all'),

      /**
        This allows you to unregister an event handler for an event name
        and callback. You should not pass in the optional binding.

        @param {String} eventName the name of the event
        @param {Function} callback a reference to the callback that was
          passed into `.on`.
      */
      off: mustImplement('OasisPort', 'off'),

      /**
        This method sends an event to the other side of the connection.

        @param {String} eventName the name of the event
        @param {Structured?} data optional data to pass along with the event
      */
      send: mustImplement('OasisPort', 'send'),

      /**
        @private

        Adapters should implement this to start receiving messages from the
        other side of the connection.

        It is up to the adapter to make sure that no messages are dropped if
        they are sent before `start` is called.
      */
      start: mustImplement('OasisPort', 'start'),

      /**
        This method sends a request to the other side of the connection.

        @param {String} requestName the name of the request
        @return {Promise} a promise that will be resolved with the value
          provided by the other side of the connection. The fulfillment value
          must be structured data.
      */
      request: function(eventName) {
        var promise = new RSVP.Promise();
        var requestId = getRequestId();
        var args = [].slice.call(arguments, 1);

        var observer = function(event) {
          if (event.requestId === requestId) {
            this.off('@response:' + eventName, observer);
            promise.resolve(event.data);
          }
        };

        this.on('@response:' + eventName, observer, this);
        this.send('@request:' + eventName, { requestId: requestId, args: args });

        return promise;
      },

      /**
        This method registers a callback to be called when a request is made
        by the other side of the connection.

        The callback will be called with a `resolver` to a promise, that the
        callback should resolve with the fulfillment value.

        @param {String} requestName the name of the request
        @param {Function} callback the callback to be called when a request
          is made.
        @param {any?} binding the value of `this` in the callback
      */
      onRequest: function(eventName, callback, binding) {
        var self = this;

        this.on('@request:' + eventName, function(data) {
          var promise = new RSVP.Promise(),
              requestId = data.requestId,
              args = data.args;

          args.unshift(promise);

          promise.then(function(data) {
            self.send('@response:' + eventName, {
              requestId: requestId,
              data: data
            });
          });


          callback.apply(binding, args);
        });
      }
    };

    var PostMessagePort = extend(OasisPort, {
      initialize: function(port) {
        this.port = port;
        this._callbacks = [];
      },

      on: function(eventName, callback, binding) {
        function wrappedCallback(event) {
          if (event.data.type === eventName) {
            callback.call(binding, event.data.data);
          }
        }

        this._callbacks.push([callback, wrappedCallback]);
        this.port.addEventListener('message', wrappedCallback);
      },

      all: function(callback, binding) {
        this.port.addEventListener('message', function(event) {
          callback.call(binding, event.data.type, event.data.data);
        });
      },

      off: function(eventName, callback) {
        var foundCallback;

        for (var i=0, l=this._callbacks.length; i<l; i++) {
          foundCallback = this._callbacks[i];
          if (foundCallback[0] === callback) {
            this.port.removeEventListener('message', foundCallback[1]);
          }
        }
      },

      send: function(eventName, data) {
        this.port.postMessage({
          type: eventName,
          data: data
        });
      },

      start: function() {
        this.port.start();
      }
    });

    function OasisMessageChannel() {}

    OasisMessageChannel.prototype = {
      start: mustImplement('OasisMessageChannel', 'start')
    };

    var PostMessageMessageChannel = extend(OasisMessageChannel, {
      initialize: function() {
        this.channel = new MessageChannel();
        this.port1 = new PostMessagePort(this.channel.port1);
        this.port2 = new PostMessagePort(this.channel.port2);
      },

      start: function() {
        this.port1.start();
        this.port2.start();
      }
    });

    /**
      This registers a sandbox type inside of the containing environment so that
      it can be referenced by URL in `createSandbox`.

      Options:

      * `capabilities`: An array of service names that will be supplied when calling
        `createSandbox`
      * `url`: The URL of the JavaScript file that contains the sandbox code

      @param {Object} options
    */
    Oasis.register = function(options) {
      assert(options.capabilities, "You are trying to register a package without any capabilities. Please provide a list of requested capabilities, or an empty array ([]).");

      packages[options.url] = options;
    };

    var ports = {};

    if (typeof window !== 'undefined') {
      iframeAdapter.connectSandbox(ports);
    } else {
      Oasis.adapters.webworker.connectSandbox(ports);
    }

    var handlers = {};
    Oasis.registerHandler = function(capability, options) {
      var port = ports[capability];

      if (port) {
        options.setupCapability(port);

        if (options.promise) {
          options.promise.then(function() {
            port.start();
          });
        } else {
          port.start();
        }
      } else {
        handlers[capability] = options;
      }
    };

    Oasis.consumers = {};

    /**
      This is the main entry point that allows sandboxes to connect back
      to their containing environment.

      It should be called once for each service provided by the containing
      environment that it wants to connect to.

      @param {String} serviceName the name of the service to connect to
      @param {Function?} callback the callback to trigger once the other
        side of the connection is available
      @return {Promise} a promise that will be resolved once the other
        side of the connection is available. You can use this instead
        of the callback.
    */
    Oasis.connect = function(capability, callback) {
      function setupCapability(Consumer, name) {
        return function(port) {
          var consumer = new Consumer(port);
          Oasis.consumers[name] = consumer;
          consumer.initialize(port, name);
          port.start();
        };
      }

      if (typeof capability === 'object') {
        var consumers = capability.consumers;

        for (var prop in consumers) {
          Oasis.registerHandler(prop, {
            setupCapability: setupCapability(consumers[prop], prop)
          });
        }
      } else if (callback) {
        Oasis.registerHandler(capability, {
          setupCapability: function(port) {
            callback(port);
          }
        });
      } else {
        var promise = new RSVP.Promise();
        Oasis.registerHandler(capability, {
          promise: promise,
          setupCapability: function(port) {
            promise.resolve(port);
          }
        });

        return promise;
      }
    };

    Oasis.portFor = function(capability) {
      var port = ports[capability];
      assert(port, "You asked for the port for the '" + capability + "' capability, but the environment did not provide one.");
      return port;
    };

    Oasis.RSVP = RSVP;

    return Oasis;
  });

(function() {
  "use strict";
  (function(globals) {
    var Conductor = globals.Conductor = function(options) {
      this.options = options || {};
      this.data = {};
      this.cards = {};
      this.services = Object.create(Conductor.services);
      this.capabilities = Conductor.capabilities.slice();
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

  })(window);

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
      });

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
          this.conductor.services.xhr = Conductor.MultiplexService.extend({ upstream: this.consumers.xhr });

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

  (function() {

  var CardReference = Conductor.CardReference = function(sandbox) {
    this.sandbox = sandbox;

    var promise = this.promise = new Conductor.Oasis.RSVP.Promise(), card = this;

    sandbox.then(function() {
      promise.resolve(card);
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
      });
    },

    updateData: function(bucket, data) {
      var sandbox = this.sandbox;
      sandbox.activatePromise.then(function() {
        sandbox.dataPort.send('updateData', { bucket: bucket, data: data });
      });
    },

    then: function() {
      return this.promise.then.apply(this.promise, arguments);
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
    return Conductor.Oasis.Consumer.extend({ autoUpdate: true,

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
              vspaceProps = ['margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width'],
              hspaceProps = ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'border-left-width', 'border-right-width'],
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
        var promises = [], names = [], promise;

        for (var metadataName in options.metadata) {
          promise = new Conductor.Oasis.RSVP.Promise();
          card.metadata[metadataName].call(card, promise);
          promises.push(promise);
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

  Conductor.renderConsumer = function(promise, card) {
    var options = Object.create(card.options);
    var domInitialized = false;

    options.events.render = function(args) {
      if(!domInitialized && card.initializeDOM) {
        domInitialized = true;
        card.initializeDOM();
      }
      card.render.apply(card, args);
    };

    return Conductor.Oasis.Consumer.extend(options);
  };

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
        var style = document.createElement('style');
        style.innerText = data;
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
    var max = DomUtils.getComputedStyleProperty(element, 'max-' + dim);
    return (max === "none") ? Infinity : parseInt(max, 10);
  }

  Conductor.HeightService = Conductor.Oasis.Service.extend({
    initialize: function (port) {
      this.sandbox.heightPort = port;
    },

    events: {
      resize: function (data) {
        // TODO: remove this and fix up the demo to use the height service
        // properly
        if (true) { return; }

        // height service is meaningless for DOMless sandboxes, eg sandboxed as
        // web workers.
        if (! this.sandbox.el) { return; }

        var el = this.sandbox.el,
            maxWidth = maxDim(el, 'width'),
            maxHeight = maxDim(el, 'height'),
            width = Math.min(data.width, maxWidth),
            height = Math.min(data.height, maxHeight);

        el.style.width = width + "px";
        el.style.height = height + "px";
      }
    }
  });

  Conductor.LifecycleService = Conductor.Oasis.Service.extend({
    events: {
      activated: function() {
        this.sandbox.activatePromise.resolve();
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

    propagateEvent: function (eventName, data) {
      this.upstream.send(eventName, data);
    },

    propagateRequest: function (eventName, data) {
      var requestEventName = eventName.substr("@request:".length),
          port = this.upstream.port,
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

  Conductor.XHRService = Conductor.Oasis.Service.extend({
    requests: {
      get: function(promise, url) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function(a1, a2, a3, a4) {
          if (this.status === 200) {
            promise.resolve(this.responseText);
          } else {
            promise.reject({status: this.status});
          }
        };
        xhr.open("get", url, true);
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

})();
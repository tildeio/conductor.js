var Oasis = requireModule("oasis");

var XHRService = Oasis.Service.extend({
  events: {

  },

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

var Conductor = function(options) {
  this.options = options || {};
};

Conductor.prototype = {
  load: function(url) {
    var capabilities = ['xhr'];

    if (this.options.testing) {
      capabilities.push('assertion');
    }

    var sandbox = Oasis.createSandbox({
      url: url,
      dependencies: ['/dist/conductor.js-0.1.0.js'],
      capabilities: capabilities,
      services: {
        xhr: XHRService
      }
    });

    sandbox.start();

    return new Conductor.Card(sandbox);
  }
};

var requiredUrls = [];
var xhrPort;
var activatePromise = new Oasis.RSVP.Promise();

Conductor.require = function(url) {
  requiredUrls.push(url);
};

Conductor.card = function(options) {
  activatePromise.then(function(data) {
    options.activate();
  });
};

Conductor.Oasis = Oasis;

Oasis.connect('xhr').then(function(port) {
  var promises = [];

  requiredUrls.forEach(function(url) {
    var promise = port.request('get', url);
    promises.push(promise);
    promise.then(function(data) {
      var script = document.createElement('script');
      script.innerText = data;
      document.body.appendChild(script);
    });
  });

  Oasis.RSVP.all(promises).then(function() {
    activatePromise.resolve();
  });
});

export = Conductor;

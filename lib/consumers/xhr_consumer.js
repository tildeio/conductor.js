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

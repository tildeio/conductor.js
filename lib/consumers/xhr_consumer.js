/*global DomUtils ConductorShims*/

var o_create = ConductorShims.o_create,
    a_forEach = ConductorShims.a_forEach;

Conductor.xhrConsumer = function(requiredUrls, requiredCSSUrls, promise, card) {
  var options = o_create(card.options);

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
      // textContent is ie9+
      script.text = script.textContent = data;
      document.body.appendChild(script);
    }

    function processCSS(data) {
      var head = document.head || document.documentElement.getElementsByTagName('head')[0],
          style = DomUtils.createStyleElement(data);
      head.appendChild(style);
    }

    a_forEach.call(requiredUrls, function( url ) {
      var promise = port.request('get', url);
      jsPromises.push( promise );
      promises.push(promise);
    });
    Conductor.Oasis.RSVP.all(jsPromises).then(function(scripts) {
      a_forEach.call(scripts, processJavaScript);
    }).then(null, Conductor.error);
    a_forEach.call(requiredCSSUrls, loadURL(processCSS));

    Conductor.Oasis.RSVP.all(promises).then(function() { promise.resolve(); }).then(null, Conductor.error);
  };

  return Conductor.Oasis.Consumer.extend(options);
};

import Oasis from "oasis";
import Conductor from "conductor";
import ConductorRequire from "conductor/require";
import OasisShims from "oasis/shims";
import DomUtils from "conductor/dom";

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
    }).fail( Conductor.error );
    a_forEach.call(ConductorRequire.requiredCSSUrls, loadURL(processCSS));

    Oasis.RSVP.all(promises).then(function() { promise.resolve(); }).fail( Conductor.error );
  }
});

export default XhrConsumer;

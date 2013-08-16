Conductor.require("myFile.js");
Conductor.requireCSS("myFile.css");

var xhrConsumer = Conductor.Oasis.Consumer.extend({
  initialize: function() {
    equal(Conductor.requiredUrls.length, 1, "The correct number of js files is required");
    equal(Conductor.requiredUrls[0], "myFile.js", "The correct js file is required");
    equal(Conductor.requiredCSSUrls.length, 1, "The correct number of CSS files is required");
    equal(Conductor.requiredCSSUrls[0], "myFile.css", "The correct CSS file is required");
    this.card.deferred.xhr.resolve();
  }
});

var card = Conductor.card({
  consumers: {
    xhr: xhrConsumer
  }
});

card.waitForActivation().then( function() {
  ok(true, "The card is activated");
  start();
});

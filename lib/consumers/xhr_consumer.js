Conductor.xhrConsumer = function(requiredUrls, promise) {
  return Conductor.Oasis.Consumer.extend({
    initialize: function() {
      var promises = [];

      requiredUrls.forEach(function(url) {
        var promise = this.port.request('get', url);
        promises.push(promise);
        promise.then(function(data) {
          var script = document.createElement('script');
          script.innerText = data;
          document.body.appendChild(script);
        });
      }, this);

      Conductor.Oasis.RSVP.all(promises).then(function() { promise.resolve(); });
    }
  });
};

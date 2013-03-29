Conductor.metadataConsumer = function(promise, card) {
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

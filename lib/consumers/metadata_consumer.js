Conductor.metadataConsumer = function(card) {
  var options = card.options;

  options.requests.metadataFor = function(name) {
    if (name === '*') {
      var values = [], names = [], defered;

      for (var metadataName in options.metadata) {
        values.push(card.metadata[metadataName].call(card));
        names.push(metadataName);
      }

      return Conductor.Oasis.RSVP.all(values).then(function(sources) {
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
      return card.metadata[name].call(card);
    }
  };

  return Conductor.Oasis.Consumer.extend(options);
};
